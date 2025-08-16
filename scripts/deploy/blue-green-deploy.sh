#!/bin/bash
# scripts/deploy/blue-green-deploy.sh
# Blue-Green deployment script for Aangan on GCP Cloud Run

set -euo pipefail

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-""}
REGION=${GCP_REGION:-"us-central1"}
NEW_IMAGE_TAG=${1:-$(date +%Y%m%d-%H%M%S)}
HEALTH_CHECK_URL="https://api.aangan.app/api/health"
DEPLOYMENT_TIMEOUT=600  # 10 minutes
TERRAFORM_DIR="terraform/production"

# Required environment variables check
REQUIRED_VARS=(
    "GCP_PROJECT_ID"
    "SLACK_WEBHOOK_URL"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] DEBUG: $1${NC}"
    fi
}

# Validation functions
validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check required commands
    local required_commands=("gcloud" "terraform" "curl" "jq" "bc")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd is required but not installed"
            exit 1
        fi
    done
    
    # Check required environment variables
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Environment variable $var is required but not set"
            exit 1
        fi
    done
    
    # Validate GCP authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "No active GCP authentication found. Please run 'gcloud auth login'"
        exit 1
    fi
    
    # Check GCP project access
    if ! gcloud projects describe "$PROJECT_ID" &>/dev/null; then
        error "Cannot access GCP project: $PROJECT_ID"
        exit 1
    fi
    
    success "Prerequisites validation completed"
}

# Get current traffic distribution
get_current_traffic() {
    debug "Getting current traffic distribution..."
    
    local blue_traffic
    local green_traffic
    
    # Get current terraform state
    if [[ -f "$TERRAFORM_DIR/terraform.tfstate" ]]; then
        blue_traffic=$(terraform -chdir="$TERRAFORM_DIR" output -raw blue_traffic_percentage 2>/dev/null || echo "100")
        green_traffic=$(terraform -chdir="$TERRAFORM_DIR" output -raw green_traffic_percentage 2>/dev/null || echo "0")
    else
        warn "No terraform state found, assuming blue=100%, green=0%"
        blue_traffic="100"
        green_traffic="0"
    fi
    
    echo "$blue_traffic:$green_traffic"
}

# Get current active and inactive environments
get_environments() {
    local traffic_info
    traffic_info=$(get_current_traffic)
    local blue_traffic="${traffic_info%:*}"
    local green_traffic="${traffic_info#*:}"
    
    if (( blue_traffic > green_traffic )); then
        echo "blue:green"
    else
        echo "green:blue"
    fi
}

# Build and push container image
build_and_push_image() {
    log "Building and pushing container image with tag: $NEW_IMAGE_TAG"
    
    local image_url="${REGION}-docker.pkg.dev/${PROJECT_ID}/aangan/backend:${NEW_IMAGE_TAG}"
    
    # Build using Cloud Build for better caching and speed
    gcloud builds submit \
        --tag "$image_url" \
        --project "$PROJECT_ID" \
        --machine-type=e2-highcpu-8 \
        --disk-size=100GB \
        .
    
    success "Image built and pushed: $image_url"
    echo "$image_url"
}

# Deploy to inactive environment
deploy_to_inactive() {
    local environments
    environments=$(get_environments)
    local active_env="${environments%:*}"
    local inactive_env="${environments#*:}"
    
    log "Deploying to inactive environment: $inactive_env"
    
    # Build and push new image
    local image_url
    image_url=$(build_and_push_image)
    
    # Update terraform variables for inactive environment
    local tf_vars=""
    if [[ "$inactive_env" == "blue" ]]; then
        tf_vars="-var=blue_version=$NEW_IMAGE_TAG"
    else
        tf_vars="-var=green_version=$NEW_IMAGE_TAG"
    fi
    
    # Deploy using terraform
    log "Applying terraform changes for $inactive_env environment..."
    terraform -chdir="$TERRAFORM_DIR" apply -auto-approve $tf_vars
    
    success "Deployed to $inactive_env environment"
    echo "$inactive_env"
}

# Comprehensive health check
health_check() {
    local env=$1
    local max_attempts=${2:-30}
    local check_interval=${3:-10}
    
    log "Running health check on $env environment (max attempts: $max_attempts)"
    
    # Get service URL based on environment
    local service_url
    if [[ "$env" == "production" ]]; then
        service_url="$HEALTH_CHECK_URL"
    else
        # Get direct Cloud Run service URL for specific environment
        local service_name="aangan-backend-$env"
        service_url=$(gcloud run services describe "$service_name" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="value(status.url)" 2>/dev/null || echo "")
        
        if [[ -z "$service_url" ]]; then
            error "Could not get URL for $env environment"
            return 1
        fi
        
        service_url="$service_url/api/health"
    fi
    
    log "Health checking: $service_url"
    
    local attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        debug "Health check attempt $attempt/$max_attempts"
        
        local response
        local http_code
        
        if response=$(curl -s -w "%{http_code}" -m 10 "$service_url" 2>/dev/null); then
            http_code="${response: -3}"
            response_body="${response%???}"
            
            if [[ "$http_code" == "200" ]]; then
                # Validate response body contains health status
                if echo "$response_body" | jq -e '.status == "healthy"' >/dev/null 2>&1; then
                    success "Health check passed for $env environment (attempt $attempt)"
                    debug "Response: $response_body"
                    return 0
                else
                    warn "Health endpoint returned 200 but status is not healthy (attempt $attempt)"
                    debug "Response: $response_body"
                fi
            else
                warn "Health check failed with HTTP $http_code (attempt $attempt)"
                debug "Response: $response_body"
            fi
        else
            warn "Health check request failed (attempt $attempt)"
        fi
        
        if [[ $attempt -lt $max_attempts ]]; then
            debug "Waiting ${check_interval}s before next attempt..."
            sleep $check_interval
        fi
        
        ((attempt++))
    done
    
    error "Health check failed for $env environment after $max_attempts attempts"
    return 1
}

# Run smoke tests
run_smoke_tests() {
    local env=$1
    log "Running smoke tests on $env environment..."
    
    # Get service URL
    local service_name="aangan-backend-$env"
    local base_url
    base_url=$(gcloud run services describe "$service_name" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || echo "")
    
    if [[ -z "$base_url" ]]; then
        error "Could not get URL for $env environment"
        return 1
    fi
    
    # Basic smoke tests
    local tests=(
        "GET:$base_url/api/health:200"
        "GET:$base_url/api/auth/me:401"  # Should return 401 without auth
        "OPTIONS:$base_url/api/health:200"  # CORS preflight
    )
    
    local failed_tests=0
    
    for test in "${tests[@]}"; do
        local method="${test%%:*}"
        local url="${test#*:}"
        url="${url%:*}"
        local expected_code="${test##*:}"
        
        debug "Testing: $method $url (expecting $expected_code)"
        
        local response
        local http_code
        
        if response=$(curl -s -w "%{http_code}" -X "$method" -m 10 "$url" 2>/dev/null); then
            http_code="${response: -3}"
            
            if [[ "$http_code" == "$expected_code" ]]; then
                debug "✓ $method $url -> $http_code (expected $expected_code)"
            else
                error "✗ $method $url -> $http_code (expected $expected_code)"
                ((failed_tests++))
            fi
        else
            error "✗ $method $url -> Request failed"
            ((failed_tests++))
        fi
    done
    
    if [[ $failed_tests -eq 0 ]]; then
        success "All smoke tests passed for $env environment"
        return 0
    else
        error "$failed_tests smoke tests failed for $env environment"
        return 1
    fi
}

# Check error rates using GCP Cloud Logging
check_error_rates() {
    local time_window=${1:-"5m"}
    local error_threshold=${2:-5.0}
    
    log "Checking error rates over the last $time_window..."
    
    # Calculate time range
    local start_time
    start_time=$(date -u -d "$time_window ago" +%Y-%m-%dT%H:%M:%SZ)
    
    # Query for 5xx errors
    local error_count
    error_count=$(gcloud logging read "
        resource.type=\"cloud_run_revision\" 
        AND httpRequest.status>=500 
        AND timestamp>=\"$start_time\"
    " \
        --project="$PROJECT_ID" \
        --limit=1000 \
        --format="value(httpRequest.status)" \
        2>/dev/null | wc -l)
    
    # Query for total requests
    local total_count
    total_count=$(gcloud logging read "
        resource.type=\"cloud_run_revision\" 
        AND httpRequest.status>=200 
        AND timestamp>=\"$start_time\"
    " \
        --project="$PROJECT_ID" \
        --limit=5000 \
        --format="value(httpRequest.status)" \
        2>/dev/null | wc -l)
    
    debug "Errors: $error_count, Total: $total_count"
    
    if [[ $total_count -gt 0 ]]; then
        local error_percentage
        error_percentage=$(echo "scale=2; $error_count * 100 / $total_count" | bc)
        
        log "Error rate: $error_percentage% ($error_count/$total_count)"
        
        if (( $(echo "$error_percentage > $error_threshold" | bc -l) )); then
            error "Error rate too high: $error_percentage% (threshold: $error_threshold%)"
            return 1
        fi
        
        success "Error rate within acceptable limits: $error_percentage%"
    else
        warn "No requests found in the last $time_window - cannot determine error rate"
    fi
    
    return 0
}

# Gradual traffic switch with monitoring
switch_traffic() {
    local target_env=$1
    log "Starting gradual traffic switch to $target_env environment"
    
    # Traffic switch steps with validation at each step
    local steps=(10 25 50 75 100)
    
    for step in "${steps[@]}"; do
        log "Switching ${step}% of traffic to $target_env"
        
        # Calculate traffic percentages
        local blue_percentage=100
        local green_percentage=0
        
        if [[ "$target_env" == "blue" ]]; then
            blue_percentage=$step
            green_percentage=$((100 - step))
        else
            blue_percentage=$((100 - step))
            green_percentage=$step
        fi
        
        # Apply traffic split via terraform
        terraform -chdir="$TERRAFORM_DIR" apply -auto-approve \
            -var="blue_traffic_percentage=$blue_percentage" \
            -var="green_traffic_percentage=$green_percentage"
        
        # Wait for changes to propagate
        log "Waiting 60s for load balancer configuration to propagate..."
        sleep 60
        
        # Monitor health and performance at this traffic level
        if ! health_check "production" 10 6; then
            error "Health check failed at ${step}% traffic - rolling back"
            return 1
        fi
        
        # Check error rates
        if ! check_error_rates "2m" 10.0; then
            error "High error rates detected at ${step}% traffic - rolling back"
            return 1
        fi
        
        success "Traffic switch to ${step}% completed successfully"
        
        # Additional monitoring wait for higher traffic percentages
        if [[ $step -ge 50 ]]; then
            log "Monitoring stability for 2 minutes at ${step}% traffic..."
            sleep 120
            
            # Re-check after monitoring period
            if ! check_error_rates "3m" 5.0; then
                error "Error rates increased during monitoring period - rolling back"
                return 1
            fi
        fi
    done
    
    success "Gradual traffic switch to $target_env completed successfully"
    return 0
}

# Emergency rollback function
rollback() {
    local reason=${1:-"Unknown reason"}
    
    error "🚨 INITIATING EMERGENCY ROLLBACK: $reason"
    
    # Determine current active environment and switch to the other one
    local environments
    environments=$(get_environments)
    local current_active="${environments%:*}"
    local rollback_target
    
    if [[ "$current_active" == "blue" ]]; then
        rollback_target="green"
    else
        rollback_target="blue"
    fi
    
    log "Rolling back from $current_active to $rollback_target"
    
    # Immediate traffic switch to rollback environment
    if [[ "$rollback_target" == "blue" ]]; then
        terraform -chdir="$TERRAFORM_DIR" apply -auto-approve \
            -var="blue_traffic_percentage=100" \
            -var="green_traffic_percentage=0"
    else
        terraform -chdir="$TERRAFORM_DIR" apply -auto-approve \
            -var="blue_traffic_percentage=0" \
            -var="green_traffic_percentage=100"
    fi
    
    # Wait and verify rollback
    log "Waiting 30s for rollback to complete..."
    sleep 30
    
    if health_check "production" 10 5; then
        success "Emergency rollback to $rollback_target environment completed successfully"
    else
        error "Rollback health check failed - manual intervention required!"
        send_alert "🆘 CRITICAL: Rollback health check failed for Aangan production. Manual intervention required immediately!"
        exit 1
    fi
    
    # Send rollback notification
    send_alert "🚨 PRODUCTION ROLLBACK: Aangan has been rolled back to $rollback_target environment. Reason: $reason. Image tag: $NEW_IMAGE_TAG"
}

# Send alert notification
send_alert() {
    local message=$1
    local severity=${2:-"high"}
    
    # Send Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color
        case $severity in
            "critical") color="danger" ;;
            "high") color="warning" ;;
            *) color="good" ;;
        esac
        
        curl -X POST \
            -H 'Content-type: application/json' \
            --data "{
                \"text\": \"$message\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"fields\": [{
                        \"title\": \"Deployment Info\",
                        \"value\": \"Project: $PROJECT_ID\\nRegion: $REGION\\nImage: $NEW_IMAGE_TAG\\nTime: $(date)\",
                        \"short\": false
                    }]
                }]
            }" \
            "${SLACK_WEBHOOK_URL}" >/dev/null 2>&1 || warn "Failed to send Slack notification"
    fi
    
    # Send PagerDuty alert for critical issues
    if [[ "$severity" == "critical" && -n "${PAGERDUTY_INTEGRATION_KEY:-}" ]]; then
        curl -X POST \
            -H 'Content-Type: application/json' \
            -d "{
                \"routing_key\": \"${PAGERDUTY_INTEGRATION_KEY}\",
                \"event_action\": \"trigger\",
                \"dedup_key\": \"aangan-deployment-$(date +%Y%m%d)\",
                \"payload\": {
                    \"summary\": \"$message\",
                    \"source\": \"aangan-deployment\",
                    \"severity\": \"critical\",
                    \"custom_details\": {
                        \"project\": \"$PROJECT_ID\",
                        \"region\": \"$REGION\",
                        \"image_tag\": \"$NEW_IMAGE_TAG\"
                    }
                }
            }" \
            https://events.pagerduty.com/v2/enqueue >/dev/null 2>&1 || warn "Failed to send PagerDuty alert"
    fi
}

# Main deployment function
main() {
    log "🚀 Starting Blue-Green Deployment for Aangan"
    log "Project: $PROJECT_ID"
    log "Region: $REGION" 
    log "New image tag: $NEW_IMAGE_TAG"
    
    # Validate prerequisites
    validate_prerequisites
    
    # Get current environment state
    local environments
    environments=$(get_environments)
    local current_active="${environments%:*}"
    local target_env="${environments#*:}"
    
    log "Current active environment: $current_active"
    log "Target deployment environment: $target_env"
    
    # Send start notification
    send_alert "🚀 Starting Aangan blue-green deployment to $target_env environment. Image tag: $NEW_IMAGE_TAG" "info"
    
    # Step 1: Deploy to inactive environment
    log "Step 1/5: Deploying to inactive environment"
    local deployed_env
    if ! deployed_env=$(deploy_to_inactive); then
        error "Failed to deploy to inactive environment"
        send_alert "❌ Aangan deployment failed during inactive environment deployment. Image tag: $NEW_IMAGE_TAG"
        exit 1
    fi
    
    # Step 2: Health check on new deployment
    log "Step 2/5: Health checking new deployment"
    if ! health_check "$deployed_env" 30 10; then
        error "Health check failed on new deployment"
        send_alert "❌ Aangan deployment failed health check on $deployed_env environment. Image tag: $NEW_IMAGE_TAG"
        exit 1
    fi
    
    # Step 3: Run smoke tests
    log "Step 3/5: Running smoke tests"
    if ! run_smoke_tests "$deployed_env"; then
        error "Smoke tests failed on $deployed_env environment"
        send_alert "❌ Aangan deployment failed smoke tests on $deployed_env environment. Image tag: $NEW_IMAGE_TAG"
        exit 1
    fi
    
    # Step 4: Gradual traffic switch with monitoring
    log "Step 4/5: Switching traffic gradually"
    if ! switch_traffic "$deployed_env"; then
        error "Traffic switch failed - initiating rollback"
        rollback "Traffic switch validation failed"
        exit 1
    fi
    
    # Step 5: Final validation
    log "Step 5/5: Final production validation"
    if ! health_check "production" 20 10; then
        error "Final production health check failed"
        rollback "Final production health check failed"
        exit 1
    fi
    
    # Final error rate check
    if ! check_error_rates "5m" 2.0; then
        warn "Elevated error rates detected but within acceptable range"
    fi
    
    success "🎉 Blue-Green deployment completed successfully!"
    success "Active environment: $deployed_env"
    success "Image version: $NEW_IMAGE_TAG"
    success "All traffic now routed to new version"
    
    # Send success notification
    send_alert "✅ SUCCESS: Aangan has been successfully deployed to $deployed_env environment with 100% traffic. Image tag: $NEW_IMAGE_TAG" "good"
    
    # Display post-deployment information
    log "Post-deployment URLs:"
    log "  - Application: https://aangan.app"
    log "  - API: https://api.aangan.app"
    log "  - Health Check: https://api.aangan.app/api/health"
    log "  - GCP Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
}

# Trap for cleanup and error handling
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        error "Deployment script interrupted or failed (exit code: $exit_code)"
        send_alert "⚠️ Aangan deployment script interrupted or failed. Manual verification may be required. Image tag: $NEW_IMAGE_TAG" "critical"
    fi
}

trap cleanup EXIT INT TERM

# Run main function with all arguments
main "$@"

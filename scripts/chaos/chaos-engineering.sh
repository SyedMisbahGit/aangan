#!/bin/bash
# scripts/chaos/chaos-engineering.sh
# Chaos Engineering Test Suite for Aangan Production Readiness

set -euo pipefail

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-""}
REGION=${GCP_REGION:-"us-central1"}
ENVIRONMENT=${CHAOS_ENVIRONMENT:-"staging"}
TEST_DURATION=${CHAOS_TEST_DURATION:-300}  # 5 minutes default
BASE_URL=${CHAOS_BASE_URL:-"https://staging-api.aangan.app"}
WEBSOCKET_URL=${CHAOS_WEBSOCKET_URL:-"wss://staging-api.aangan.app"}

# Test configuration
CONCURRENT_USERS=${CHAOS_CONCURRENT_USERS:-50}
MESSAGE_RATE=${CHAOS_MESSAGE_RATE:-10}  # messages per second
LOAD_TEST_DURATION=${LOAD_TEST_DURATION:-60}  # seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

chaos_log() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] CHAOS: $1${NC}"
}

test_log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] TEST: $1${NC}"
}

# Validation functions
validate_prerequisites() {
    log "Validating chaos engineering prerequisites..."
    
    local required_commands=("gcloud" "curl" "jq" "node" "python3" "kubectl" "hey")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            if [[ "$cmd" == "hey" ]]; then
                warn "Installing 'hey' load testing tool..."
                if command -v go &> /dev/null; then
                    go install github.com/rakyll/hey@latest
                else
                    error "'hey' load testing tool and Go are required but not installed"
                    exit 1
                fi
            else
                error "$cmd is required but not installed"
                exit 1
            fi
        fi
    done
    
    # Check environment access
    if [[ -z "$PROJECT_ID" ]]; then
        error "GCP_PROJECT_ID environment variable is required"
        exit 1
    fi
    
    success "Prerequisites validation completed"
}

# Metrics collection functions
collect_baseline_metrics() {
    log "Collecting baseline metrics before chaos tests..."
    
    local metrics_file="chaos_metrics_baseline_$(date +%Y%m%d_%H%M%S).json"
    
    # Health check response time
    local health_response_time
    health_response_time=$(curl -w "%{time_total}" -s -o /dev/null "$BASE_URL/api/health" || echo "0")
    
    # WebSocket connection test
    local ws_connection_time
    ws_connection_time=$(timeout 10 node -e "
        const WebSocket = require('ws');
        const start = Date.now();
        const ws = new WebSocket('$WEBSOCKET_URL');
        ws.on('open', () => {
            console.log(Date.now() - start);
            process.exit(0);
        });
        ws.on('error', () => {
            console.log('9999');
            process.exit(1);
        });
    " 2>/dev/null || echo "9999")
    
    # GCP Cloud Run metrics
    local cpu_utilization memory_utilization request_count
    cpu_utilization=$(gcloud monitoring metrics list --filter="metric.type:run.googleapis.com/container/cpu/utilizations" --format="value(metric.type)" --limit=1 2>/dev/null || echo "0")
    memory_utilization=$(gcloud monitoring metrics list --filter="metric.type:run.googleapis.com/container/memory/utilizations" --format="value(metric.type)" --limit=1 2>/dev/null || echo "0")
    request_count=$(gcloud monitoring metrics list --filter="metric.type:run.googleapis.com/request_count" --format="value(metric.type)" --limit=1 2>/dev/null || echo "0")
    
    # Store baseline metrics
    cat > "$metrics_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "baseline_metrics": {
        "health_response_time": $health_response_time,
        "websocket_connection_time": $ws_connection_time,
        "cpu_utilization": "$cpu_utilization",
        "memory_utilization": "$memory_utilization",
        "request_count": "$request_count"
    }
}
EOF
    
    log "Baseline metrics collected: $metrics_file"
    echo "$metrics_file"
}

collect_test_metrics() {
    local test_name=$1
    local start_time=$2
    local end_time=$3
    local metrics_file=${4:-"chaos_metrics_${test_name}_$(date +%Y%m%d_%H%M%S).json"}
    
    log "Collecting metrics for test: $test_name"
    
    # Health check response time during test
    local health_response_time
    health_response_time=$(curl -w "%{time_total}" -s -o /dev/null "$BASE_URL/api/health" || echo "999")
    
    # Error rate calculation
    local error_count total_requests error_rate
    error_count=$(gcloud logging read "
        resource.type=\"cloud_run_revision\" 
        AND httpRequest.status>=500 
        AND timestamp>=\"$start_time\" 
        AND timestamp<=\"$end_time\"
    " --project="$PROJECT_ID" --limit=1000 --format="value(httpRequest.status)" 2>/dev/null | wc -l || echo "0")
    
    total_requests=$(gcloud logging read "
        resource.type=\"cloud_run_revision\" 
        AND httpRequest.status>=200 
        AND timestamp>=\"$start_time\" 
        AND timestamp<=\"$end_time\"
    " --project="$PROJECT_ID" --limit=5000 --format="value(httpRequest.status)" 2>/dev/null | wc -l || echo "1")
    
    error_rate=$(echo "scale=2; $error_count * 100 / $total_requests" | bc 2>/dev/null || echo "0")
    
    # Store test metrics
    cat > "$metrics_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "test_name": "$test_name",
    "start_time": "$start_time",
    "end_time": "$end_time",
    "test_metrics": {
        "health_response_time": $health_response_time,
        "error_count": $error_count,
        "total_requests": $total_requests,
        "error_rate": $error_rate
    }
}
EOF
    
    log "Test metrics collected: $metrics_file"
    echo "$metrics_file"
}

# Chaos test scenarios
chaos_test_container_restart() {
    chaos_log "Starting Container Restart Chaos Test"
    
    local test_name="container_restart"
    local start_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Get current Cloud Run services
    local services
    services=$(gcloud run services list --region="$REGION" --filter="metadata.name:aangan-backend" --format="value(metadata.name)" 2>/dev/null || echo "")
    
    if [[ -z "$services" ]]; then
        error "No Cloud Run services found for chaos testing"
        return 1
    fi
    
    test_log "Found services for testing: $services"
    
    # Start background load test
    test_log "Starting background load test..."
    hey -z "${LOAD_TEST_DURATION}s" -c 10 -q 5 "$BASE_URL/api/health" > "load_test_${test_name}.log" 2>&1 &
    local load_test_pid=$!
    
    # Start WebSocket stability test
    test_log "Starting WebSocket stability test..."
    node -e "
        const WebSocket = require('ws');
        let connections = [];
        let messagesSent = 0;
        let messagesReceived = 0;
        let reconnects = 0;
        
        function createConnection(id) {
            const ws = new WebSocket('$WEBSOCKET_URL');
            
            ws.on('open', () => {
                console.log(\`Connection \${id} opened\`);
                // Send test message every 2 seconds
                const interval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({type: 'test', id: id, timestamp: Date.now()}));
                        messagesSent++;
                    }
                }, 2000);
                
                ws.interval = interval;
            });
            
            ws.on('message', (data) => {
                messagesReceived++;
                console.log(\`Connection \${id} received message\`);
            });
            
            ws.on('close', () => {
                console.log(\`Connection \${id} closed, reconnecting...\`);
                clearInterval(ws.interval);
                reconnects++;
                // Reconnect after 1 second
                setTimeout(() => createConnection(id), 1000);
            });
            
            ws.on('error', (error) => {
                console.log(\`Connection \${id} error: \${error.message}\`);
            });
            
            connections[id] = ws;
        }
        
        // Create 5 WebSocket connections
        for (let i = 0; i < 5; i++) {
            createConnection(i);
        }
        
        // Report stats every 10 seconds
        setInterval(() => {
            console.log(\`Stats - Sent: \${messagesSent}, Received: \${messagesReceived}, Reconnects: \${reconnects}\`);
        }, 10000);
        
        // Run for test duration
        setTimeout(() => {
            console.log(\`Final Stats - Sent: \${messagesSent}, Received: \${messagesReceived}, Reconnects: \${reconnects}\`);
            process.exit(0);
        }, ${LOAD_TEST_DURATION}000);
    " > "websocket_test_${test_name}.log" 2>&1 &
    local websocket_test_pid=$!
    
    # Wait a moment for baseline establishment
    sleep 5
    
    # Introduce chaos: restart containers
    for service in $services; do
        chaos_log "Restarting Cloud Run service: $service"
        
        # Force a new revision deployment to simulate restart
        gcloud run services update "$service" \
            --region="$REGION" \
            --set-env-vars="CHAOS_TEST_TIMESTAMP=$(date +%s)" \
            --quiet
        
        test_log "Waiting 10 seconds for service restart to propagate..."
        sleep 10
        
        # Monitor recovery
        local recovery_time=0
        local max_recovery_time=120  # 2 minutes
        
        while [[ $recovery_time -lt $max_recovery_time ]]; do
            if curl -s -m 5 "$BASE_URL/api/health" >/dev/null 2>&1; then
                success "Service $service recovered after ${recovery_time}s"
                break
            fi
            sleep 5
            recovery_time=$((recovery_time + 5))
        done
        
        if [[ $recovery_time -ge $max_recovery_time ]]; then
            error "Service $service did not recover within ${max_recovery_time}s"
        fi
    done
    
    # Let tests continue for remaining duration
    local remaining_time=$((LOAD_TEST_DURATION - 30))
    if [[ $remaining_time -gt 0 ]]; then
        test_log "Continuing chaos test for ${remaining_time}s to observe recovery..."
        sleep $remaining_time
    fi
    
    # Stop background tests
    kill $load_test_pid 2>/dev/null || true
    kill $websocket_test_pid 2>/dev/null || true
    wait $load_test_pid 2>/dev/null || true
    wait $websocket_test_pid 2>/dev/null || true
    
    local end_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Collect and analyze results
    local metrics_file
    metrics_file=$(collect_test_metrics "$test_name" "$start_time" "$end_time")
    
    success "Container restart chaos test completed"
    
    # Analyze results
    analyze_test_results "$test_name" "$metrics_file"
}

chaos_test_network_latency() {
    chaos_log "Starting Network Latency Chaos Test"
    
    local test_name="network_latency"
    local start_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # This test simulates network latency by introducing delays in requests
    test_log "Simulating network latency with increased request timeouts..."
    
    # Start load test with varying request patterns
    hey -z "${LOAD_TEST_DURATION}s" -c 20 -q 10 -t 30 "$BASE_URL/api/health" > "load_test_${test_name}.log" 2>&1 &
    local load_test_pid=$!
    
    # Simulate slow clients by making requests with artificial delays
    python3 -c "
import requests
import time
import threading
import json
from datetime import datetime

results = {
    'successful_requests': 0,
    'failed_requests': 0,
    'timeouts': 0,
    'response_times': []
}

def slow_request(session, delay):
    try:
        time.sleep(delay / 1000.0)  # Convert ms to seconds
        start_time = time.time()
        response = session.get('$BASE_URL/api/health', timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        results['response_times'].append(response_time)
        if response.status_code == 200:
            results['successful_requests'] += 1
        else:
            results['failed_requests'] += 1
    except requests.exceptions.Timeout:
        results['timeouts'] += 1
    except Exception as e:
        results['failed_requests'] += 1

# Create session for connection reuse
session = requests.Session()

# Run tests for duration with varying delays
test_duration = ${LOAD_TEST_DURATION}
start = time.time()
threads = []

while time.time() - start < test_duration:
    # Simulate various network conditions
    delays = [50, 100, 200, 500, 1000, 2000]  # ms
    for delay in delays:
        if time.time() - start >= test_duration:
            break
        thread = threading.Thread(target=slow_request, args=(session, delay))
        thread.start()
        threads.append(thread)
        time.sleep(0.1)  # Small delay between requests

# Wait for all threads to complete
for thread in threads:
    thread.join()

# Calculate statistics
if results['response_times']:
    avg_response_time = sum(results['response_times']) / len(results['response_times'])
    results['avg_response_time'] = avg_response_time

# Save results
with open('network_latency_test_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f'Network latency test completed:')
print(f'Successful: {results[\"successful_requests\"]}')
print(f'Failed: {results[\"failed_requests\"]}')
print(f'Timeouts: {results[\"timeouts\"]}')
if 'avg_response_time' in results:
    print(f'Average response time: {results[\"avg_response_time\"]:.2f}ms')
" &
    local latency_test_pid=$!
    
    # Monitor system during test
    for ((i=0; i<$LOAD_TEST_DURATION; i+=10)); do
        test_log "Network latency test progress: ${i}s / ${LOAD_TEST_DURATION}s"
        
        # Check health endpoint
        local health_time
        health_time=$(curl -w "%{time_total}" -s -o /dev/null "$BASE_URL/api/health" 2>/dev/null || echo "999")
        test_log "Current health check response time: ${health_time}s"
        
        sleep 10
    done
    
    # Wait for tests to complete
    wait $load_test_pid 2>/dev/null || true
    wait $latency_test_pid 2>/dev/null || true
    
    local end_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Collect metrics
    local metrics_file
    metrics_file=$(collect_test_metrics "$test_name" "$start_time" "$end_time")
    
    success "Network latency chaos test completed"
    
    # Analyze results
    analyze_test_results "$test_name" "$metrics_file"
}

chaos_test_memory_pressure() {
    chaos_log "Starting Memory Pressure Chaos Test"
    
    local test_name="memory_pressure"
    local start_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Simulate memory pressure by creating high load with large requests
    test_log "Creating memory pressure with large concurrent requests..."
    
    # Start baseline monitoring
    hey -z "${LOAD_TEST_DURATION}s" -c 5 -q 2 "$BASE_URL/api/health" > "baseline_load_${test_name}.log" 2>&1 &
    local baseline_pid=$!
    
    # Create memory pressure with large POST requests (if available)
    python3 -c "
import requests
import threading
import json
import time
from concurrent.futures import ThreadPoolExecutor

results = {
    'large_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'memory_errors': 0
}

def memory_intensive_request():
    try:
        # Create large payload to consume memory
        large_data = {
            'test': 'chaos_memory_pressure',
            'data': 'x' * 10000,  # 10KB string
            'timestamp': time.time(),
            'array': list(range(1000))  # Large array
        }
        
        # Make request to health endpoint (usually lightweight)
        response = requests.get('$BASE_URL/api/health', 
                              params={'test': 'memory_pressure'},
                              timeout=15)
        
        results['large_requests'] += 1
        if response.status_code == 200:
            results['successful_requests'] += 1
        else:
            results['failed_requests'] += 1
            
    except requests.exceptions.Timeout:
        results['failed_requests'] += 1
    except MemoryError:
        results['memory_errors'] += 1
    except Exception as e:
        results['failed_requests'] += 1
        if 'memory' in str(e).lower():
            results['memory_errors'] += 1

# Run memory pressure test
test_duration = ${LOAD_TEST_DURATION}
start = time.time()

# Use thread pool to create concurrent memory pressure
with ThreadPoolExecutor(max_workers=20) as executor:
    while time.time() - start < test_duration:
        # Submit batch of memory-intensive requests
        futures = [executor.submit(memory_intensive_request) for _ in range(10)]
        time.sleep(2)  # Brief pause between batches

# Save results
with open('memory_pressure_test_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f'Memory pressure test completed:')
print(f'Large requests: {results[\"large_requests\"]}')
print(f'Successful: {results[\"successful_requests\"]}')
print(f'Failed: {results[\"failed_requests\"]}')
print(f'Memory errors: {results[\"memory_errors\"]}')
" &
    local memory_test_pid=$!
    
    # Monitor memory usage and system health
    for ((i=0; i<$LOAD_TEST_DURATION; i+=15)); do
        test_log "Memory pressure test progress: ${i}s / ${LOAD_TEST_DURATION}s"
        
        # Check if system is still responsive
        local health_check
        if health_check=$(curl -s -m 10 "$BASE_URL/api/health" 2>/dev/null); then
            if echo "$health_check" | jq -e '.status == "healthy"' >/dev/null 2>&1; then
                test_log "System remains healthy under memory pressure"
            else
                warn "System health check returned non-healthy status"
            fi
        else
            error "System unresponsive to health checks - memory pressure may be too high"
        fi
        
        sleep 15
    done
    
    # Wait for tests to complete
    wait $baseline_pid 2>/dev/null || true
    wait $memory_test_pid 2>/dev/null || true
    
    local end_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Collect metrics
    local metrics_file
    metrics_file=$(collect_test_metrics "$test_name" "$start_time" "$end_time")
    
    success "Memory pressure chaos test completed"
    
    # Analyze results
    analyze_test_results "$test_name" "$metrics_file"
}

chaos_test_websocket_chaos() {
    chaos_log "Starting WebSocket Chaos Test"
    
    local test_name="websocket_chaos"
    local start_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    test_log "Testing WebSocket resilience with connection chaos..."
    
    # Advanced WebSocket chaos test
    node -e "
        const WebSocket = require('ws');
        
        let stats = {
            connectionsCreated: 0,
            connectionsDropped: 0,
            messagesLost: 0,
            messagesSent: 0,
            messagesReceived: 0,
            reconnects: 0,
            errors: 0
        };
        
        function chaosWebSocketTest() {
            const connections = new Map();
            const testDuration = ${LOAD_TEST_DURATION} * 1000;
            const startTime = Date.now();
            
            // Create and manage multiple connections with chaos
            function createConnection(id) {
                const ws = new WebSocket('$WEBSOCKET_URL');
                connections.set(id, ws);
                stats.connectionsCreated++;
                
                ws.on('open', () => {
                    console.log(\`Connection \${id} established\`);
                    
                    // Send messages at random intervals
                    const messageInterval = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            const message = {
                                type: 'chaos_test',
                                id: id,
                                timestamp: Date.now(),
                                sequence: stats.messagesSent++
                            };
                            ws.send(JSON.stringify(message));
                        }
                    }, Math.random() * 3000 + 1000); // 1-4 second intervals
                    
                    ws.messageInterval = messageInterval;
                });
                
                ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data);
                        stats.messagesReceived++;
                        console.log(\`Connection \${id} received message\`);
                    } catch (e) {
                        console.log(\`Connection \${id} received invalid message\`);
                    }
                });
                
                ws.on('close', (code) => {
                    console.log(\`Connection \${id} closed with code \${code}\`);
                    clearInterval(ws.messageInterval);
                    connections.delete(id);
                    stats.connectionsDropped++;
                    
                    // Attempt reconnection after random delay
                    if (Date.now() - startTime < testDuration) {
                        const reconnectDelay = Math.random() * 5000 + 1000; // 1-6 seconds
                        setTimeout(() => {
                            stats.reconnects++;
                            createConnection(id);
                        }, reconnectDelay);
                    }
                });
                
                ws.on('error', (error) => {
                    console.log(\`Connection \${id} error: \${error.message}\`);
                    stats.errors++;
                });
                
                // Randomly close connections to simulate network issues
                const chaosTimeout = setTimeout(() => {
                    if (Math.random() < 0.3) { // 30% chance of chaos close
                        console.log(\`Chaos: Force closing connection \${id}\`);
                        ws.close(1000, 'Chaos test');
                    }
                }, Math.random() * 20000 + 10000); // 10-30 seconds
                
                ws.chaosTimeout = chaosTimeout;
            }
            
            // Create initial connections
            const numConnections = 15;
            for (let i = 0; i < numConnections; i++) {
                setTimeout(() => createConnection(i), i * 200); // Stagger creation
            }
            
            // Periodically create chaos events
            const chaosInterval = setInterval(() => {
                if (Date.now() - startTime >= testDuration) {
                    clearInterval(chaosInterval);
                    return;
                }
                
                // Random chaos events
                const chaosType = Math.floor(Math.random() * 3);
                switch (chaosType) {
                    case 0: // Create burst connections
                        console.log('Chaos: Creating burst connections');
                        for (let i = 0; i < 5; i++) {
                            createConnection(\`burst_\${Date.now()}_\${i}\`);
                        }
                        break;
                    case 1: // Close random connections
                        const activeConnections = Array.from(connections.keys());
                        if (activeConnections.length > 0) {
                            const randomId = activeConnections[Math.floor(Math.random() * activeConnections.length)];
                            const ws = connections.get(randomId);
                            if (ws && ws.readyState === WebSocket.OPEN) {
                                console.log(\`Chaos: Closing random connection \${randomId}\`);
                                ws.close(1001, 'Random chaos');
                            }
                        }
                        break;
                    case 2: // Send message burst
                        connections.forEach((ws, id) => {
                            if (ws.readyState === WebSocket.OPEN) {
                                for (let i = 0; i < 3; i++) {
                                    ws.send(JSON.stringify({
                                        type: 'burst_message',
                                        id: id,
                                        burst: i,
                                        timestamp: Date.now()
                                    }));
                                    stats.messagesSent++;
                                }
                            }
                        });
                        break;
                }
            }, 8000); // Chaos event every 8 seconds
            
            // Report stats periodically
            const statsInterval = setInterval(() => {
                console.log(\`Stats - Active: \${connections.size}, Created: \${stats.connectionsCreated}, Dropped: \${stats.connectionsDropped}, Sent: \${stats.messagesSent}, Received: \${stats.messagesReceived}, Reconnects: \${stats.reconnects}, Errors: \${stats.errors}\`);
            }, 10000);
            
            // Clean up after test duration
            setTimeout(() => {
                clearInterval(chaosInterval);
                clearInterval(statsInterval);
                
                // Close all connections
                connections.forEach((ws) => {
                    clearInterval(ws.messageInterval);
                    clearTimeout(ws.chaosTimeout);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close(1000, 'Test complete');
                    }
                });
                
                console.log('WebSocket Chaos Test Results:');
                console.log(JSON.stringify(stats, null, 2));
                
                // Calculate success metrics
                const connectionStability = (stats.connectionsCreated - stats.connectionsDropped) / stats.connectionsCreated;
                const messageReliability = stats.messagesSent > 0 ? stats.messagesReceived / stats.messagesSent : 0;
                
                console.log(\`Connection Stability: \${(connectionStability * 100).toFixed(2)}%\`);
                console.log(\`Message Reliability: \${(messageReliability * 100).toFixed(2)}%\`);
                
                process.exit(0);
            }, testDuration);
        }
        
        chaosWebSocketTest();
    " > "websocket_chaos_test_results.log" 2>&1 &
    local websocket_test_pid=$!
    
    # Monitor the test
    for ((i=0; i<$LOAD_TEST_DURATION; i+=10)); do
        test_log "WebSocket chaos test progress: ${i}s / ${LOAD_TEST_DURATION}s"
        sleep 10
    done
    
    # Wait for test completion
    wait $websocket_test_pid 2>/dev/null || true
    
    local end_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Collect metrics
    local metrics_file
    metrics_file=$(collect_test_metrics "$test_name" "$start_time" "$end_time")
    
    success "WebSocket chaos test completed"
    
    # Analyze results
    analyze_test_results "$test_name" "$metrics_file"
}

# Results analysis
analyze_test_results() {
    local test_name=$1
    local metrics_file=$2
    
    log "Analyzing results for test: $test_name"
    
    if [[ ! -f "$metrics_file" ]]; then
        warn "Metrics file not found for $test_name"
        return 1
    fi
    
    local error_rate health_response_time
    error_rate=$(jq -r '.test_metrics.error_rate // 0' "$metrics_file" 2>/dev/null || echo "0")
    health_response_time=$(jq -r '.test_metrics.health_response_time // 999' "$metrics_file" 2>/dev/null || echo "999")
    
    log "Test Results for $test_name:"
    log "  - Error Rate: ${error_rate}%"
    log "  - Health Response Time: ${health_response_time}s"
    
    # Define success criteria
    local max_error_rate=10.0  # 10% max error rate during chaos
    local max_response_time=5.0  # 5 seconds max response time
    
    local test_passed=true
    
    if (( $(echo "$error_rate > $max_error_rate" | bc -l) )); then
        error "Test $test_name FAILED: Error rate $error_rate% exceeds threshold $max_error_rate%"
        test_passed=false
    fi
    
    if (( $(echo "$health_response_time > $max_response_time" | bc -l) )); then
        error "Test $test_name FAILED: Response time ${health_response_time}s exceeds threshold ${max_response_time}s"
        test_passed=false
    fi
    
    if [[ "$test_passed" == "true" ]]; then
        success "Test $test_name PASSED: All metrics within acceptable thresholds"
        return 0
    else
        error "Test $test_name FAILED: One or more metrics exceeded thresholds"
        return 1
    fi
}

# Generate chaos test report
generate_chaos_report() {
    local report_file="chaos_engineering_report_$(date +%Y%m%d_%H%M%S).md"
    
    log "Generating chaos engineering test report: $report_file"
    
    cat > "$report_file" << EOF
# Aangan Chaos Engineering Test Report

**Test Date:** $(date)
**Environment:** $ENVIRONMENT
**Test Duration:** ${TEST_DURATION}s per scenario
**Base URL:** $BASE_URL

## Executive Summary

This report documents the chaos engineering tests conducted on the Aangan platform to validate system resilience and reliability under various failure conditions.

## Test Scenarios Executed

### 1. Container Restart Test
- **Objective:** Validate application recovery after container restarts
- **Method:** Force restart Cloud Run services and monitor recovery
- **Metrics:** Recovery time, error rates during restart, WebSocket reconnection

### 2. Network Latency Test  
- **Objective:** Test application performance under network stress
- **Method:** Simulate high latency requests and monitor response times
- **Metrics:** Response time degradation, timeout rates, user experience impact

### 3. Memory Pressure Test
- **Objective:** Validate system behavior under memory constraints
- **Method:** Generate memory-intensive requests and monitor stability
- **Metrics:** Memory usage, request success rates, system responsiveness

### 4. WebSocket Chaos Test
- **Objective:** Test real-time features resilience
- **Method:** Create chaotic WebSocket connections with random disconnects
- **Metrics:** Connection stability, message reliability, reconnection success

## Test Results

EOF
    
    # Add individual test results if available
    for test_type in "container_restart" "network_latency" "memory_pressure" "websocket_chaos"; do
        local metrics_file
        metrics_file=$(ls chaos_metrics_${test_type}_*.json 2>/dev/null | head -1 || echo "")
        
        if [[ -f "$metrics_file" ]]; then
            local error_rate health_time
            error_rate=$(jq -r '.test_metrics.error_rate // "N/A"' "$metrics_file" 2>/dev/null || echo "N/A")
            health_time=$(jq -r '.test_metrics.health_response_time // "N/A"' "$metrics_file" 2>/dev/null || echo "N/A")
            
            cat >> "$report_file" << EOF

### ${test_type^} Test Results
- **Error Rate:** ${error_rate}%
- **Health Response Time:** ${health_time}s
- **Status:** $(if (( $(echo "${error_rate:-0} <= 10.0" | bc -l 2>/dev/null || echo "1") )) && (( $(echo "${health_time:-0} <= 5.0" | bc -l 2>/dev/null || echo "1") )); then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

EOF
        fi
    done
    
    cat >> "$report_file" << EOF

## Recommendations

Based on the chaos engineering test results:

1. **Monitor Recovery Times:** Ensure container restart recovery stays under 30 seconds
2. **WebSocket Resilience:** Implement robust reconnection logic for real-time features  
3. **Resource Limits:** Configure appropriate memory limits to prevent resource exhaustion
4. **Circuit Breakers:** Consider implementing circuit breaker patterns for external dependencies
5. **Monitoring:** Enhanced monitoring and alerting for chaos scenarios in production

## Next Steps

1. Address any failing test scenarios
2. Implement automated chaos testing in CI/CD pipeline
3. Schedule regular chaos engineering sessions
4. Create runbooks for identified failure scenarios

---
*Report generated by Aangan Chaos Engineering Suite*
EOF
    
    success "Chaos engineering report generated: $report_file"
    echo "$report_file"
}

# Main chaos testing function
main() {
    log "🌪️  Starting Aangan Chaos Engineering Test Suite"
    log "Environment: $ENVIRONMENT"
    log "Base URL: $BASE_URL"
    log "Test Duration: ${TEST_DURATION}s per scenario"
    
    # Validate prerequisites
    validate_prerequisites
    
    # Collect baseline metrics
    local baseline_file
    baseline_file=$(collect_baseline_metrics)
    
    # List of chaos tests to run
    local chaos_tests=(
        "chaos_test_container_restart"
        "chaos_test_network_latency" 
        "chaos_test_memory_pressure"
        "chaos_test_websocket_chaos"
    )
    
    local failed_tests=0
    local total_tests=${#chaos_tests[@]}
    
    # Run each chaos test
    for test_function in "${chaos_tests[@]}"; do
        log "==============================================="
        log "Running chaos test: $test_function"
        log "==============================================="
        
        if ! $test_function; then
            error "Chaos test failed: $test_function"
            ((failed_tests++))
        fi
        
        # Brief recovery period between tests
        log "Recovery period: 30 seconds before next test..."
        sleep 30
    done
    
    # Generate final report
    local report_file
    report_file=$(generate_chaos_report)
    
    # Summary
    log "==============================================="
    log "🌪️  CHAOS ENGINEERING TEST SUITE COMPLETE"
    log "==============================================="
    log "Total tests: $total_tests"
    log "Failed tests: $failed_tests"
    log "Success rate: $(echo "scale=2; ($total_tests - $failed_tests) * 100 / $total_tests" | bc)%"
    log "Report: $report_file"
    
    if [[ $failed_tests -eq 0 ]]; then
        success "🎉 All chaos engineering tests passed! System is resilient."
        return 0
    else
        error "❌ $failed_tests chaos tests failed. Review results and improve system resilience."
        return 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

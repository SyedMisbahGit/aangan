# terraform/staging/outputs.tf
# Staging Environment Outputs for Aangan

# Network and Load Balancer Outputs
output "staging_global_ip_address" {
  description = "Global IP address for the staging load balancer"
  value       = google_compute_global_address.aangan_staging_ip.address
}

output "staging_global_ip_name" {
  description = "Name of the staging global IP address resource"
  value       = google_compute_global_address.aangan_staging_ip.name
}

output "staging_load_balancer_url" {
  description = "URL of the staging load balancer"
  value       = "https://staging.aangan.app"
}

output "staging_api_url" {
  description = "Staging API endpoint URL"
  value       = "https://staging-api.aangan.app"
}

# Cloud Run Service Outputs
output "staging_blue_service_name" {
  description = "Name of the staging blue Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_staging_blue.name
}

output "staging_green_service_name" {
  description = "Name of the staging green Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_staging_green.name
}

output "staging_blue_service_url" {
  description = "URL of the staging blue Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_staging_blue.uri
  sensitive   = true
}

output "staging_green_service_url" {
  description = "URL of the staging green Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_staging_green.uri
  sensitive   = true
}

output "staging_blue_service_status" {
  description = "Status of the staging blue Cloud Run service"
  value = {
    name     = google_cloud_run_v2_service.aangan_staging_blue.name
    location = google_cloud_run_v2_service.aangan_staging_blue.location
    traffic  = var.blue_traffic_percentage
    version  = var.blue_version
  }
}

output "staging_green_service_status" {
  description = "Status of the staging green Cloud Run service"
  value = {
    name     = google_cloud_run_v2_service.aangan_staging_green.name
    location = google_cloud_run_v2_service.aangan_staging_green.location
    traffic  = var.green_traffic_percentage
    version  = var.green_version
  }
}

# Traffic Distribution
output "staging_traffic_distribution" {
  description = "Current staging traffic distribution between environments"
  value = {
    blue_percentage  = var.blue_traffic_percentage
    green_percentage = var.green_traffic_percentage
    active_version   = var.blue_traffic_percentage > var.green_traffic_percentage ? var.blue_version : var.green_version
    inactive_version = var.blue_traffic_percentage > var.green_traffic_percentage ? var.green_version : var.blue_version
  }
}

# SSL Certificate Outputs
output "staging_ssl_certificate_name" {
  description = "Name of the staging managed SSL certificate"
  value       = google_compute_managed_ssl_certificate.aangan_staging_ssl.name
}

output "staging_ssl_certificate_domains" {
  description = "Domains covered by the staging SSL certificate"
  value       = google_compute_managed_ssl_certificate.aangan_staging_ssl.managed[0].domains
}

# Service Account Outputs
output "staging_cloud_run_service_account" {
  description = "Email of the staging Cloud Run service account"
  value       = google_service_account.staging_cloud_run_sa.email
}

# Secret Manager Outputs
output "staging_secret_names" {
  description = "Names of the staging Secret Manager secrets"
  value = {
    database_url       = google_secret_manager_secret.staging_database_url.secret_id
    jwt_access_secret  = google_secret_manager_secret.staging_jwt_access_secret.secret_id
    jwt_refresh_secret = google_secret_manager_secret.staging_jwt_refresh_secret.secret_id
    sentry_dsn         = google_secret_manager_secret.staging_sentry_dsn.secret_id
  }
  sensitive = true
}

# Health Check Outputs
output "staging_health_check_name" {
  description = "Name of the staging health check"
  value       = google_compute_health_check.aangan_staging_health_check.name
}

output "staging_health_check_url" {
  description = "Staging health check endpoint URL"
  value       = "https://staging-api.aangan.app/api/health"
}

# Backend Service Outputs
output "staging_backend_service_name" {
  description = "Name of the staging backend service"
  value       = google_compute_backend_service.aangan_staging_backend.name
}

output "staging_backend_service_id" {
  description = "ID of the staging backend service"
  value       = google_compute_backend_service.aangan_staging_backend.id
}

# Frontend Storage Outputs
output "staging_frontend_bucket_name" {
  description = "Name of the staging frontend storage bucket"
  value       = google_storage_bucket.staging_frontend_bucket.name
}

output "staging_frontend_bucket_url" {
  description = "URL of the staging frontend storage bucket"
  value       = google_storage_bucket.staging_frontend_bucket.url
}

# Network Endpoint Groups
output "staging_network_endpoint_groups" {
  description = "Staging network endpoint group details"
  value = {
    blue_neg = {
      name = google_compute_region_network_endpoint_group.aangan_staging_blue_neg.name
      id   = google_compute_region_network_endpoint_group.aangan_staging_blue_neg.id
    }
    green_neg = {
      name = google_compute_region_network_endpoint_group.aangan_staging_green_neg.name
      id   = google_compute_region_network_endpoint_group.aangan_staging_green_neg.id
    }
  }
}

# Deployment Information
output "staging_deployment_info" {
  description = "Current staging deployment information"
  value = {
    project_id            = var.project_id
    region                = var.region
    environment           = var.environment
    blue_version          = var.blue_version
    green_version         = var.green_version
    active_environment    = var.blue_traffic_percentage > var.green_traffic_percentage ? "blue" : "green"
    deployment_timestamp  = timestamp()
  }
}

# Monitoring and Logging
output "staging_monitoring_info" {
  description = "Staging monitoring and logging configuration"
  value = {
    project_id        = var.project_id
    logging_enabled   = var.enable_logging
    monitoring_enabled = var.enable_monitoring
    log_level         = var.log_level
    debug_enabled     = var.enable_debug_features
    chaos_testing     = var.enable_chaos_testing
  }
}

# URLs for operational use
output "staging_operational_urls" {
  description = "URLs for staging monitoring and management"
  value = {
    main_application    = "https://staging.aangan.app"
    api_endpoint       = "https://staging-api.aangan.app"
    health_check       = "https://staging-api.aangan.app/api/health"
    websocket_endpoint = "wss://staging-api.aangan.app"
    gcp_console_run    = "https://console.cloud.google.com/run?project=${var.project_id}"
    gcp_console_lb     = "https://console.cloud.google.com/net-services/loadbalancing/list/loadBalancers?project=${var.project_id}"
    gcp_monitoring     = "https://console.cloud.google.com/monitoring?project=${var.project_id}"
    gcp_logging        = "https://console.cloud.google.com/logs?project=${var.project_id}"
  }
}

# DNS Configuration for Staging
output "staging_dns_configuration" {
  description = "DNS configuration required for staging domains"
  value = {
    domain             = "staging.aangan.app"
    api_subdomain      = "staging-api.aangan.app"
    load_balancer_ip   = google_compute_global_address.aangan_staging_ip.address
    dns_records_needed = [
      {
        name  = "staging"
        type  = "A"
        value = google_compute_global_address.aangan_staging_ip.address
      },
      {
        name  = "staging-api"
        type  = "A"
        value = google_compute_global_address.aangan_staging_ip.address
      }
    ]
  }
}

# Resource Scaling Information
output "staging_scaling_configuration" {
  description = "Current staging scaling configuration"
  value = {
    min_instances    = var.min_instances
    max_instances    = var.max_instances
    memory_limit     = var.memory_limit
    cpu_limit        = var.cpu_limit
    auto_scaling     = true
  }
}

# Testing Configuration
output "staging_testing_configuration" {
  description = "Staging testing and development configuration"
  value = {
    chaos_testing_enabled  = var.enable_chaos_testing
    debug_features_enabled = var.enable_debug_features
    load_testing_enabled   = var.enable_load_testing
    profiling_enabled      = var.enable_profiling
    data_retention_days    = var.staging_data_retention_days
    allowed_origins        = var.allowed_origins
  }
}

# Blue-Green Deployment Information
output "staging_blue_green_status" {
  description = "Current blue-green deployment status for staging"
  value = {
    current_deployment_model = "blue-green"
    blue_environment = {
      service_name = google_cloud_run_v2_service.aangan_staging_blue.name
      traffic_percentage = var.blue_traffic_percentage
      version = var.blue_version
      status = "active"
    }
    green_environment = {
      service_name = google_cloud_run_v2_service.aangan_staging_green.name
      traffic_percentage = var.green_traffic_percentage
      version = var.green_version
      status = var.green_traffic_percentage > 0 ? "active" : "standby"
    }
    load_balancer_ip = google_compute_global_address.aangan_staging_ip.address
    ssl_certificate_status = "provisioned"
  }
}

# Chaos Engineering Configuration
output "staging_chaos_engineering_config" {
  description = "Configuration for chaos engineering tests in staging"
  value = {
    base_url = "https://staging-api.aangan.app"
    websocket_url = "wss://staging-api.aangan.app"
    health_endpoint = "https://staging-api.aangan.app/api/health"
    chaos_testing_enabled = var.enable_chaos_testing
    environment = "staging"
    min_instances = var.min_instances
    max_instances = var.max_instances
    target_services = [
      google_cloud_run_v2_service.aangan_staging_blue.name,
      google_cloud_run_v2_service.aangan_staging_green.name
    ]
  }
}

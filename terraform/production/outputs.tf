# terraform/production/outputs.tf

# Network and Load Balancer Outputs
output "global_ip_address" {
  description = "Global IP address for the load balancer"
  value       = google_compute_global_address.aangan_ip.address
}

output "global_ip_name" {
  description = "Name of the global IP address resource"
  value       = google_compute_global_address.aangan_ip.name
}

output "load_balancer_url" {
  description = "URL of the load balancer"
  value       = "https://aangan.app"
}

output "api_url" {
  description = "API endpoint URL"
  value       = "https://api.aangan.app"
}

# Cloud Run Service Outputs
output "blue_service_name" {
  description = "Name of the blue Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_blue.name
}

output "green_service_name" {
  description = "Name of the green Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_green.name
}

output "blue_service_url" {
  description = "URL of the blue Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_blue.uri
  sensitive   = true
}

output "green_service_url" {
  description = "URL of the green Cloud Run service"
  value       = google_cloud_run_v2_service.aangan_green.uri
  sensitive   = true
}

output "blue_service_status" {
  description = "Status of the blue Cloud Run service"
  value = {
    name     = google_cloud_run_v2_service.aangan_blue.name
    location = google_cloud_run_v2_service.aangan_blue.location
    traffic  = var.blue_traffic_percentage
    version  = var.blue_version
  }
}

output "green_service_status" {
  description = "Status of the green Cloud Run service"
  value = {
    name     = google_cloud_run_v2_service.aangan_green.name
    location = google_cloud_run_v2_service.aangan_green.location
    traffic  = var.green_traffic_percentage
    version  = var.green_version
  }
}

# Traffic Distribution
output "traffic_distribution" {
  description = "Current traffic distribution between environments"
  value = {
    blue_percentage  = var.blue_traffic_percentage
    green_percentage = var.green_traffic_percentage
    active_version   = var.blue_traffic_percentage > var.green_traffic_percentage ? var.blue_version : var.green_version
    inactive_version = var.blue_traffic_percentage > var.green_traffic_percentage ? var.green_version : var.blue_version
  }
}

# SSL Certificate Outputs
output "ssl_certificate_name" {
  description = "Name of the managed SSL certificate"
  value       = google_compute_managed_ssl_certificate.aangan_ssl.name
}

output "ssl_certificate_domains" {
  description = "Domains covered by the SSL certificate"
  value       = google_compute_managed_ssl_certificate.aangan_ssl.managed[0].domains
}

# Service Account Outputs
output "cloud_run_service_account" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run_sa.email
}

# Secret Manager Outputs
output "secret_names" {
  description = "Names of the Secret Manager secrets"
  value = {
    database_url       = google_secret_manager_secret.database_url.secret_id
    jwt_access_secret  = google_secret_manager_secret.jwt_access_secret.secret_id
    jwt_refresh_secret = google_secret_manager_secret.jwt_refresh_secret.secret_id
    sentry_dsn         = google_secret_manager_secret.sentry_dsn.secret_id
  }
  sensitive = true
}

# Container Registry Outputs
output "artifact_registry_repository" {
  description = "Artifact Registry repository details"
  value = {
    name     = google_artifact_registry_repository.aangan_repo.name
    location = google_artifact_registry_repository.aangan_repo.location
    format   = google_artifact_registry_repository.aangan_repo.format
    url      = "${var.region}-docker.pkg.dev/${var.project_id}/aangan"
  }
}

# Health Check Outputs
output "health_check_name" {
  description = "Name of the health check"
  value       = google_compute_health_check.aangan_health_check.name
}

output "health_check_url" {
  description = "Health check endpoint URL"
  value       = "https://api.aangan.app/api/health"
}

# Backend Service Outputs
output "backend_service_name" {
  description = "Name of the backend service"
  value       = google_compute_backend_service.aangan_backend.name
}

output "backend_service_id" {
  description = "ID of the backend service"
  value       = google_compute_backend_service.aangan_backend.id
}

# Frontend Storage Outputs
output "frontend_bucket_name" {
  description = "Name of the frontend storage bucket"
  value       = google_storage_bucket.frontend_bucket.name
}

output "frontend_bucket_url" {
  description = "URL of the frontend storage bucket"
  value       = google_storage_bucket.frontend_bucket.url
}

# Security Policy Outputs
output "security_policy_name" {
  description = "Name of the Cloud Armor security policy"
  value       = google_compute_security_policy.aangan_security_policy.name
}

output "security_policy_id" {
  description = "ID of the Cloud Armor security policy"
  value       = google_compute_security_policy.aangan_security_policy.id
}

# Network Endpoint Groups
output "network_endpoint_groups" {
  description = "Network endpoint group details"
  value = {
    blue_neg = {
      name = google_compute_region_network_endpoint_group.aangan_blue_neg.name
      id   = google_compute_region_network_endpoint_group.aangan_blue_neg.id
    }
    green_neg = {
      name = google_compute_region_network_endpoint_group.aangan_green_neg.name
      id   = google_compute_region_network_endpoint_group.aangan_green_neg.id
    }
  }
}

# Deployment Information
output "deployment_info" {
  description = "Current deployment information"
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
output "monitoring_info" {
  description = "Monitoring and logging configuration"
  value = {
    project_id        = var.project_id
    logging_enabled   = var.enable_logging
    monitoring_enabled = var.enable_monitoring
    log_level         = var.log_level
  }
}

# URLs for operational use
output "operational_urls" {
  description = "URLs for operational monitoring and management"
  value = {
    main_application    = "https://aangan.app"
    api_endpoint       = "https://api.aangan.app"
    health_check       = "https://api.aangan.app/api/health"
    gcp_console_run    = "https://console.cloud.google.com/run?project=${var.project_id}"
    gcp_console_lb     = "https://console.cloud.google.com/net-services/loadbalancing/list/loadBalancers?project=${var.project_id}"
    gcp_monitoring     = "https://console.cloud.google.com/monitoring?project=${var.project_id}"
    gcp_logging        = "https://console.cloud.google.com/logs?project=${var.project_id}"
  }
}

# DNS Configuration (for reference)
output "dns_configuration" {
  description = "DNS configuration required for the domains"
  value = {
    domain             = "aangan.app"
    api_subdomain      = "api.aangan.app"
    www_subdomain      = "www.aangan.app"
    load_balancer_ip   = google_compute_global_address.aangan_ip.address
    dns_records_needed = [
      {
        name  = "@"
        type  = "A"
        value = google_compute_global_address.aangan_ip.address
      },
      {
        name  = "www"
        type  = "A"
        value = google_compute_global_address.aangan_ip.address
      },
      {
        name  = "api"
        type  = "A"
        value = google_compute_global_address.aangan_ip.address
      }
    ]
  }
}

# Resource Scaling Information
output "scaling_configuration" {
  description = "Current scaling configuration"
  value = {
    min_instances    = var.min_instances
    max_instances    = var.max_instances
    memory_limit     = var.memory_limit
    cpu_limit        = var.cpu_limit
    auto_scaling     = true
  }
}

# Cost Optimization Information
output "cost_optimization_info" {
  description = "Information for cost optimization"
  value = {
    region                = var.region
    min_instances         = var.min_instances
    memory_per_instance   = var.memory_limit
    cpu_per_instance      = var.cpu_limit
    estimated_monthly_cost = "Contact Google Cloud for current pricing"
    cost_optimization_tips = [
      "Monitor actual usage and adjust min_instances if needed",
      "Use committed use discounts for predictable workloads",
      "Enable autoscaling to optimize for variable traffic",
      "Review and optimize container startup time"
    ]
  }
}

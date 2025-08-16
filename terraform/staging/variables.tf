# terraform/staging/variables.tf
# Staging Environment Variables for Aangan

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  validation {
    condition     = length(var.project_id) > 0
    error_message = "Project ID cannot be empty."
  }
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
  validation {
    condition = contains([
      "us-central1", "us-east1", "us-west1", "us-west2", "us-west3", "us-west4",
      "europe-west1", "europe-west2", "europe-west3", "europe-west4", "europe-west6",
      "asia-southeast1", "asia-east1", "asia-northeast1"
    ], var.region)
    error_message = "Region must be a valid GCP region."
  }
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (always staging for this config)"
  type        = string
  default     = "staging"
  validation {
    condition     = var.environment == "staging"
    error_message = "This configuration is for staging environment only."
  }
}

variable "blue_version" {
  description = "Blue environment image version/tag"
  type        = string
  default     = "staging-blue"
}

variable "green_version" {
  description = "Green environment image version/tag"
  type        = string
  default     = "staging-green"
}

variable "blue_traffic_percentage" {
  description = "Percentage of traffic to route to blue environment (0-100)"
  type        = number
  default     = 100
  validation {
    condition     = var.blue_traffic_percentage >= 0 && var.blue_traffic_percentage <= 100
    error_message = "Blue traffic percentage must be between 0 and 100."
  }
}

variable "green_traffic_percentage" {
  description = "Percentage of traffic to route to green environment (0-100)"
  type        = number
  default     = 0
  validation {
    condition     = var.green_traffic_percentage >= 0 && var.green_traffic_percentage <= 100
    error_message = "Green traffic percentage must be between 0 and 100."
  }
  validation {
    condition     = var.blue_traffic_percentage + var.green_traffic_percentage == 100
    error_message = "Blue and green traffic percentages must sum to 100."
  }
}

# Staging-specific sensitive variables
variable "staging_database_url" {
  description = "Staging database connection URL"
  type        = string
  sensitive   = true
}

variable "staging_jwt_access_secret" {
  description = "Staging JWT access token secret"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.staging_jwt_access_secret) >= 32
    error_message = "Staging JWT access secret must be at least 32 characters long."
  }
}

variable "staging_jwt_refresh_secret" {
  description = "Staging JWT refresh token secret"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.staging_jwt_refresh_secret) >= 32
    error_message = "Staging JWT refresh secret must be at least 32 characters long."
  }
}

variable "staging_sentry_dsn" {
  description = "Staging Sentry DSN for error tracking"
  type        = string
  sensitive   = true
  default     = ""
}

# Staging resource limits (lower than production)
variable "min_instances" {
  description = "Minimum number of instances for staging"
  type        = number
  default     = 1
  validation {
    condition     = var.min_instances >= 0 && var.min_instances <= 20
    error_message = "Staging minimum instances must be between 0 and 20."
  }
}

variable "max_instances" {
  description = "Maximum number of instances for staging"
  type        = number
  default     = 20
  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 50
    error_message = "Staging maximum instances must be between 1 and 50."
  }
  validation {
    condition     = var.max_instances >= var.min_instances
    error_message = "Maximum instances must be greater than or equal to minimum instances."
  }
}

# Staging resource limits (lower than production)
variable "memory_limit" {
  description = "Memory limit for Cloud Run services in staging"
  type        = string
  default     = "1Gi"
  validation {
    condition = can(regex("^[0-9]+(Mi|Gi)$", var.memory_limit))
    error_message = "Memory limit must be in format like '1Gi' or '512Mi'."
  }
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run services in staging"
  type        = string
  default     = "1000m"
  validation {
    condition = can(regex("^[0-9]+(m|)$", var.cpu_limit))
    error_message = "CPU limit must be in format like '1000m' or '1'."
  }
}

# Monitoring and alerting (enabled for staging)
variable "enable_monitoring" {
  description = "Enable GCP monitoring and alerting"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable detailed logging"
  type        = bool
  default     = true
}

variable "log_level" {
  description = "Application log level for staging"
  type        = string
  default     = "debug"
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be one of: debug, info, warn, error."
  }
}

# Security configuration (relaxed for staging)
variable "allowed_origins" {
  description = "List of allowed CORS origins for staging"
  type        = list(string)
  default     = ["https://staging.aangan.app", "https://staging-api.aangan.app", "http://localhost:3000", "http://localhost:5173"]
}

variable "enable_cloud_armor" {
  description = "Enable Cloud Armor security policies"
  type        = bool
  default     = false  # Disabled for staging to allow testing
}

# Staging-specific configuration
variable "enable_debug_features" {
  description = "Enable debugging features in staging"
  type        = bool
  default     = true
}

variable "enable_chaos_testing" {
  description = "Enable chaos testing endpoints"
  type        = bool
  default     = true
}

variable "staging_data_retention_days" {
  description = "Number of days to retain staging data"
  type        = number
  default     = 7
  validation {
    condition     = var.staging_data_retention_days >= 1 && var.staging_data_retention_days <= 30
    error_message = "Staging data retention must be between 1 and 30 days."
  }
}

# CDN configuration
variable "enable_cdn" {
  description = "Enable CDN for frontend assets"
  type        = bool
  default     = true
}

# SSL policy (compatible for testing)
variable "ssl_policy" {
  description = "SSL policy for HTTPS load balancer"
  type        = string
  default     = "COMPATIBLE"
  validation {
    condition     = contains(["COMPATIBLE", "MODERN", "RESTRICTED"], var.ssl_policy)
    error_message = "SSL policy must be one of: COMPATIBLE, MODERN, RESTRICTED."
  }
}

# Feature flags for staging
variable "enable_websockets" {
  description = "Enable WebSocket functionality"
  type        = bool
  default     = true
}

variable "enable_real_time_features" {
  description = "Enable real-time features"
  type        = bool
  default     = true
}

variable "enable_analytics" {
  description = "Enable analytics and tracking"
  type        = bool
  default     = true
}

# Development/testing features (enabled for staging)
variable "enable_debug_logs" {
  description = "Enable debug logging"
  type        = bool
  default     = true
}

variable "enable_profiling" {
  description = "Enable application profiling"
  type        = bool
  default     = true
}

variable "enable_load_testing" {
  description = "Enable load testing endpoints"
  type        = bool
  default     = true
}

# Database configuration (separate from production)
variable "enable_cloud_sql" {
  description = "Enable Cloud SQL database for staging"
  type        = bool
  default     = false  # Assuming external DB for staging
}

# Notification configuration (optional for staging)
variable "slack_webhook_url" {
  description = "Slack webhook URL for staging notifications"
  type        = string
  sensitive   = true
  default     = ""
}

# Performance settings for staging
variable "request_timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 30
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 10
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

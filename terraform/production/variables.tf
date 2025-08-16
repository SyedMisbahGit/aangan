# terraform/production/variables.tf

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
  description = "Environment name (production, staging)"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "Environment must be either 'production' or 'staging'."
  }
}

variable "blue_version" {
  description = "Blue environment image version/tag"
  type        = string
  default     = "latest"
}

variable "green_version" {
  description = "Green environment image version/tag"
  type        = string
  default     = "latest"
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

# Sensitive variables for secrets
variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "jwt_access_secret" {
  description = "JWT access token secret"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.jwt_access_secret) >= 32
    error_message = "JWT access secret must be at least 32 characters long."
  }
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.jwt_refresh_secret) >= 32
    error_message = "JWT refresh secret must be at least 32 characters long."
  }
}

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
  type        = string
  sensitive   = true
  default     = ""
}

# Scaling configuration
variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 2
  validation {
    condition     = var.min_instances >= 0 && var.min_instances <= 100
    error_message = "Minimum instances must be between 0 and 100."
  }
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 100
  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 1000
    error_message = "Maximum instances must be between 1 and 1000."
  }
  validation {
    condition     = var.max_instances >= var.min_instances
    error_message = "Maximum instances must be greater than or equal to minimum instances."
  }
}

# Resource limits
variable "memory_limit" {
  description = "Memory limit for Cloud Run services"
  type        = string
  default     = "2Gi"
  validation {
    condition = can(regex("^[0-9]+(Mi|Gi)$", var.memory_limit))
    error_message = "Memory limit must be in format like '1Gi' or '512Mi'."
  }
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run services"
  type        = string
  default     = "2000m"
  validation {
    condition = can(regex("^[0-9]+(m|)$", var.cpu_limit))
    error_message = "CPU limit must be in format like '1000m' or '2'."
  }
}

# Monitoring and alerting
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
  description = "Application log level"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be one of: debug, info, warn, error."
  }
}

# Security configuration
variable "allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = ["https://aangan.app", "https://www.aangan.app"]
}

variable "enable_cloud_armor" {
  description = "Enable Cloud Armor security policies"
  type        = bool
  default     = true
}

variable "rate_limit_requests_per_minute" {
  description = "Rate limit: requests per minute per IP"
  type        = number
  default     = 100
  validation {
    condition     = var.rate_limit_requests_per_minute > 0 && var.rate_limit_requests_per_minute <= 10000
    error_message = "Rate limit must be between 1 and 10000 requests per minute."
  }
}

# Database configuration
variable "enable_cloud_sql" {
  description = "Enable Cloud SQL database"
  type        = bool
  default     = false
}

variable "db_tier" {
  description = "Cloud SQL database tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_availability_type" {
  description = "Database availability type (ZONAL or REGIONAL)"
  type        = string
  default     = "ZONAL"
  validation {
    condition     = contains(["ZONAL", "REGIONAL"], var.db_availability_type)
    error_message = "Database availability type must be either ZONAL or REGIONAL."
  }
}

# Backup configuration
variable "enable_backups" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 365
    error_message = "Backup retention days must be between 1 and 365."
  }
}

# Load balancer configuration
variable "enable_cdn" {
  description = "Enable CDN for frontend assets"
  type        = bool
  default     = true
}

variable "ssl_policy" {
  description = "SSL policy for HTTPS load balancer"
  type        = string
  default     = "MODERN"
  validation {
    condition     = contains(["COMPATIBLE", "MODERN", "RESTRICTED"], var.ssl_policy)
    error_message = "SSL policy must be one of: COMPATIBLE, MODERN, RESTRICTED."
  }
}

# Notification configuration
variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  sensitive   = true
  default     = ""
}

variable "pagerduty_integration_key" {
  description = "PagerDuty integration key for alerts"
  type        = string
  sensitive   = true
  default     = ""
}

# Feature flags
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

# Development/debugging
variable "enable_debug_logs" {
  description = "Enable debug logging (only for non-production)"
  type        = bool
  default     = false
}

variable "enable_profiling" {
  description = "Enable application profiling"
  type        = bool
  default     = false
}

# terraform/staging/main.tf
# Staging Environment Configuration for Aangan

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.84"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.84"
    }
  }

  backend "gcs" {
    bucket = "aangan-terraform-state"
    prefix = "staging"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "compute.googleapis.com",
    "secretmanager.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "cloudbuild.googleapis.com",
    "container.googleapis.com",
    "artifactregistry.googleapis.com"
  ])
  
  service = each.value
  disable_on_destroy = false
}

# Staging Blue Environment - Cloud Run Service
resource "google_cloud_run_v2_service" "aangan_staging_blue" {
  name     = "aangan-staging-blue"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 1  # Lower for staging
      max_instance_count = 20 # Lower for staging
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/aangan/backend:${var.blue_version}"
      
      resources {
        limits = {
          memory = "1Gi"    # Lower for staging
          cpu    = "1000m"  # Lower for staging
        }
        startup_cpu_boost = true
      }
      
      ports {
        container_port = 3001
        name          = "http1"
      }
      
      env {
        name  = "NODE_ENV"
        value = "staging"
      }
      
      env {
        name  = "PORT"
        value = "3001"
      }
      
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_database_url.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_ACCESS_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_jwt_access_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_REFRESH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_jwt_refresh_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "SENTRY_DSN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_sentry_dsn.secret_id
            version = "latest"
          }
        }
      }
      
      # Staging specific environment variables
      env {
        name  = "CHAOS_TESTING_ENABLED"
        value = "true"
      }
      
      env {
        name  = "LOG_LEVEL"
        value = "debug"
      }
      
      startup_probe {
        http_get {
          path = "/api/health"
          port = 3001
        }
        initial_delay_seconds = 10
        timeout_seconds       = 5
        period_seconds        = 3
        failure_threshold     = 10
      }
      
      liveness_probe {
        http_get {
          path = "/api/health"
          port = 3001
        }
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 60
        failure_threshold     = 3
      }
    }

    service_account = google_service_account.staging_cloud_run_sa.email

    annotations = {
      "autoscaling.knative.dev/minScale" = "1"
      "autoscaling.knative.dev/maxScale" = "20"
      "run.googleapis.com/execution-environment" = "gen2"
      "run.googleapis.com/cpu-throttling" = "false"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = var.blue_traffic_percentage
    tag     = "blue"
  }

  depends_on = [google_project_service.required_apis]
}

# Staging Green Environment - Cloud Run Service  
resource "google_cloud_run_v2_service" "aangan_staging_green" {
  name     = "aangan-staging-green"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 1  # Lower for staging
      max_instance_count = 20 # Lower for staging
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/aangan/backend:${var.green_version}"
      
      resources {
        limits = {
          memory = "1Gi"    # Lower for staging
          cpu    = "1000m"  # Lower for staging
        }
        startup_cpu_boost = true
      }
      
      ports {
        container_port = 3001
        name          = "http1"
      }
      
      env {
        name  = "NODE_ENV"
        value = "staging"
      }
      
      env {
        name  = "PORT"
        value = "3001"
      }
      
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_database_url.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_ACCESS_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_jwt_access_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_REFRESH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_jwt_refresh_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "SENTRY_DSN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.staging_sentry_dsn.secret_id
            version = "latest"
          }
        }
      }
      
      # Staging specific environment variables
      env {
        name  = "CHAOS_TESTING_ENABLED"
        value = "true"
      }
      
      env {
        name  = "LOG_LEVEL"
        value = "debug"
      }
      
      startup_probe {
        http_get {
          path = "/api/health"
          port = 3001
        }
        initial_delay_seconds = 10
        timeout_seconds       = 5
        period_seconds        = 3
        failure_threshold     = 10
      }
      
      liveness_probe {
        http_get {
          path = "/api/health"
          port = 3001
        }
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 60
        failure_threshold     = 3
      }
    }

    service_account = google_service_account.staging_cloud_run_sa.email

    annotations = {
      "autoscaling.knative.dev/minScale" = "1"
      "autoscaling.knative.dev/maxScale" = "20"
      "run.googleapis.com/execution-environment" = "gen2"
      "run.googleapis.com/cpu-throttling" = "false"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = var.green_traffic_percentage
    tag     = "green"
  }

  depends_on = [google_project_service.required_apis]
}

# Global IP Address for Staging
resource "google_compute_global_address" "aangan_staging_ip" {
  name = "aangan-staging-global-ip"
}

# URL Map for Load Balancer
resource "google_compute_url_map" "aangan_staging_url_map" {
  name            = "aangan-staging-url-map"
  default_service = google_compute_backend_service.aangan_staging_backend.id

  host_rule {
    hosts        = ["staging-api.aangan.app", "staging.aangan.app"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.aangan_staging_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.aangan_staging_backend.id
    }
    
    path_rule {
      paths   = ["/health"]
      service = google_compute_backend_service.aangan_staging_backend.id
    }
    
    path_rule {
      paths   = ["/*"]
      service = google_compute_backend_service.staging_frontend_backend.id
    }
  }
}

# Backend Service for Staging API
resource "google_compute_backend_service" "aangan_staging_backend" {
  name                  = "aangan-staging-backend-service"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  enable_cdn           = false
  load_balancing_scheme = "EXTERNAL_MANAGED"

  dynamic "backend" {
    for_each = var.blue_traffic_percentage > 0 ? [1] : []
    content {
      group           = google_compute_region_network_endpoint_group.aangan_staging_blue_neg.id
      balancing_mode  = "UTILIZATION"
      capacity_scaler = var.blue_traffic_percentage / 100.0
    }
  }

  dynamic "backend" {
    for_each = var.green_traffic_percentage > 0 ? [1] : []
    content {
      group           = google_compute_region_network_endpoint_group.aangan_staging_green_neg.id
      balancing_mode  = "UTILIZATION"
      capacity_scaler = var.green_traffic_percentage / 100.0
    }
  }

  health_checks = [google_compute_health_check.aangan_staging_health_check.id]

  log_config {
    enable = true
    sample_rate = 1.0
  }
}

# Backend Service for Staging Frontend (Cloud Storage)
resource "google_compute_backend_service" "staging_frontend_backend" {
  name                  = "aangan-staging-frontend-service"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 10
  enable_cdn           = true
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group           = google_compute_backend_bucket.staging_frontend_bucket.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                 = 3600
    max_ttl                     = 86400
    client_ttl                  = 3600
    negative_caching            = true
    serve_while_stale           = 86400
  }
}

# Cloud Storage bucket for staging frontend
resource "google_storage_bucket" "staging_frontend_bucket" {
  name          = "${var.project_id}-staging-frontend"
  location      = "US"
  force_destroy = true  # Allow destruction for staging

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  cors {
    origin          = ["https://staging.aangan.app", "https://staging-api.aangan.app"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Backend bucket for staging frontend
resource "google_compute_backend_bucket" "staging_frontend_bucket" {
  name        = "aangan-staging-frontend-backend"
  bucket_name = google_storage_bucket.staging_frontend_bucket.name
  enable_cdn  = true
}

# Health Check for Staging
resource "google_compute_health_check" "aangan_staging_health_check" {
  name               = "aangan-staging-health-check"
  timeout_sec        = 5
  check_interval_sec = 10
  healthy_threshold  = 2
  unhealthy_threshold = 3

  http_health_check {
    port               = 3001
    request_path       = "/api/health"
    response           = ""
  }

  log_config {
    enable = true
  }
}

# Network Endpoint Groups for Staging
resource "google_compute_region_network_endpoint_group" "aangan_staging_blue_neg" {
  name                  = "aangan-staging-blue-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.aangan_staging_blue.name
  }
}

resource "google_compute_region_network_endpoint_group" "aangan_staging_green_neg" {
  name                  = "aangan-staging-green-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.aangan_staging_green.name
  }
}

# SSL Certificate for Staging
resource "google_compute_managed_ssl_certificate" "aangan_staging_ssl" {
  name = "aangan-staging-ssl-cert"

  managed {
    domains = ["staging-api.aangan.app", "staging.aangan.app"]
  }
}

# HTTPS Proxy for Staging
resource "google_compute_target_https_proxy" "aangan_staging_https_proxy" {
  name             = "aangan-staging-https-proxy"
  url_map          = google_compute_url_map.aangan_staging_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.aangan_staging_ssl.id]
}

# HTTP to HTTPS Redirect for Staging
resource "google_compute_url_map" "aangan_staging_https_redirect" {
  name = "aangan-staging-https-redirect"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query           = false
  }
}

resource "google_compute_target_http_proxy" "aangan_staging_http_proxy" {
  name    = "aangan-staging-http-proxy"
  url_map = google_compute_url_map.aangan_staging_https_redirect.id
}

# Global Forwarding Rules for Staging
resource "google_compute_global_forwarding_rule" "aangan_staging_https_forwarding_rule" {
  name       = "aangan-staging-https-forwarding-rule"
  target     = google_compute_target_https_proxy.aangan_staging_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.aangan_staging_ip.address
}

resource "google_compute_global_forwarding_rule" "aangan_staging_http_forwarding_rule" {
  name       = "aangan-staging-http-forwarding-rule"
  target     = google_compute_target_http_proxy.aangan_staging_http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.aangan_staging_ip.address
}

# Service Account for Staging Cloud Run
resource "google_service_account" "staging_cloud_run_sa" {
  account_id   = "aangan-staging-cloud-run-sa"
  display_name = "Aangan Staging Cloud Run Service Account"
  description  = "Service account for Aangan Staging Cloud Run services"
}

# IAM bindings for staging service account
resource "google_project_iam_member" "staging_cloud_run_sa_bindings" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor",
    "roles/cloudsql.client"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.staging_cloud_run_sa.email}"
}

# Secret Manager Secrets for Staging
resource "google_secret_manager_secret" "staging_database_url" {
  secret_id = "staging-database-url"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "staging_jwt_access_secret" {
  secret_id = "staging-jwt-access-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "staging_jwt_refresh_secret" {
  secret_id = "staging-jwt-refresh-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "staging_sentry_dsn" {
  secret_id = "staging-sentry-dsn"
  
  replication {
    auto {}
  }
}

# Add secret versions for staging (these will be managed separately for security)
resource "google_secret_manager_secret_version" "staging_database_url" {
  secret      = google_secret_manager_secret.staging_database_url.id
  secret_data = var.staging_database_url
}

resource "google_secret_manager_secret_version" "staging_jwt_access_secret" {
  secret      = google_secret_manager_secret.staging_jwt_access_secret.id
  secret_data = var.staging_jwt_access_secret
}

resource "google_secret_manager_secret_version" "staging_jwt_refresh_secret" {
  secret      = google_secret_manager_secret.staging_jwt_refresh_secret.id
  secret_data = var.staging_jwt_refresh_secret
}

resource "google_secret_manager_secret_version" "staging_sentry_dsn" {
  secret      = google_secret_manager_secret.staging_sentry_dsn.id
  secret_data = var.staging_sentry_dsn
}

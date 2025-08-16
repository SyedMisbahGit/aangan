# terraform/production/main.tf
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
    prefix = "production"
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

# Artifact Registry for container images
resource "google_artifact_registry_repository" "aangan_repo" {
  location      = var.region
  repository_id = "aangan"
  description   = "Aangan application container images"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Blue Environment - Cloud Run Service
resource "google_cloud_run_v2_service" "aangan_blue" {
  name     = "aangan-backend-blue"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 2
      max_instance_count = 100
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/aangan/backend:${var.blue_version}"
      
      resources {
        limits = {
          memory = "2Gi"
          cpu    = "2000m"
        }
        startup_cpu_boost = true
      }
      
      ports {
        container_port = 3001
        name          = "http1"
      }
      
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      
      env {
        name  = "PORT"
        value = "3001"
      }
      
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_ACCESS_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_access_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_REFRESH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_refresh_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "SENTRY_DSN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.sentry_dsn.secret_id
            version = "latest"
          }
        }
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

    service_account = google_service_account.cloud_run_sa.email

    annotations = {
      "autoscaling.knative.dev/minScale" = "2"
      "autoscaling.knative.dev/maxScale" = "100"
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

# Green Environment - Cloud Run Service  
resource "google_cloud_run_v2_service" "aangan_green" {
  name     = "aangan-backend-green"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 2
      max_instance_count = 100
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/aangan/backend:${var.green_version}"
      
      resources {
        limits = {
          memory = "2Gi"
          cpu    = "2000m"
        }
        startup_cpu_boost = true
      }
      
      ports {
        container_port = 3001
        name          = "http1"
      }
      
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      
      env {
        name  = "PORT"
        value = "3001"
      }
      
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_ACCESS_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_access_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_REFRESH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_refresh_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "SENTRY_DSN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.sentry_dsn.secret_id
            version = "latest"
          }
        }
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

    service_account = google_service_account.cloud_run_sa.email

    annotations = {
      "autoscaling.knative.dev/minScale" = "2"
      "autoscaling.knative.dev/maxScale" = "100"
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

# Global IP Address
resource "google_compute_global_address" "aangan_ip" {
  name = "aangan-global-ip"
}

# URL Map for Load Balancer
resource "google_compute_url_map" "aangan_url_map" {
  name            = "aangan-url-map"
  default_service = google_compute_backend_service.aangan_backend.id

  host_rule {
    hosts        = ["api.aangan.app", "aangan.app"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.aangan_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.aangan_backend.id
    }
    
    path_rule {
      paths   = ["/health"]
      service = google_compute_backend_service.aangan_backend.id
    }
    
    path_rule {
      paths   = ["/*"]
      service = google_compute_backend_service.frontend_backend.id
    }
  }
}

# Backend Service for API
resource "google_compute_backend_service" "aangan_backend" {
  name                  = "aangan-backend-service"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  enable_cdn           = false
  load_balancing_scheme = "EXTERNAL_MANAGED"

  dynamic "backend" {
    for_each = var.blue_traffic_percentage > 0 ? [1] : []
    content {
      group           = google_compute_region_network_endpoint_group.aangan_blue_neg.id
      balancing_mode  = "UTILIZATION"
      capacity_scaler = var.blue_traffic_percentage / 100.0
    }
  }

  dynamic "backend" {
    for_each = var.green_traffic_percentage > 0 ? [1] : []
    content {
      group           = google_compute_region_network_endpoint_group.aangan_green_neg.id
      balancing_mode  = "UTILIZATION"
      capacity_scaler = var.green_traffic_percentage / 100.0
    }
  }

  health_checks = [google_compute_health_check.aangan_health_check.id]

  log_config {
    enable = true
    sample_rate = 1.0
  }
}

# Backend Service for Frontend (Cloud Storage)
resource "google_compute_backend_service" "frontend_backend" {
  name                  = "aangan-frontend-service"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 10
  enable_cdn           = true
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group           = google_compute_backend_bucket.frontend_bucket.id
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

# Cloud Storage bucket for frontend
resource "google_storage_bucket" "frontend_bucket" {
  name          = "${var.project_id}-frontend"
  location      = "US"
  force_destroy = false

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  cors {
    origin          = ["https://aangan.app", "https://www.aangan.app"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Backend bucket for frontend
resource "google_compute_backend_bucket" "frontend_bucket" {
  name        = "aangan-frontend-backend"
  bucket_name = google_storage_bucket.frontend_bucket.name
  enable_cdn  = true
}

# Health Check
resource "google_compute_health_check" "aangan_health_check" {
  name               = "aangan-health-check"
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

# Network Endpoint Groups
resource "google_compute_region_network_endpoint_group" "aangan_blue_neg" {
  name                  = "aangan-blue-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.aangan_blue.name
  }
}

resource "google_compute_region_network_endpoint_group" "aangan_green_neg" {
  name                  = "aangan-green-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.aangan_green.name
  }
}

# SSL Certificate
resource "google_compute_managed_ssl_certificate" "aangan_ssl" {
  name = "aangan-ssl-cert"

  managed {
    domains = ["api.aangan.app", "aangan.app", "www.aangan.app"]
  }
}

# HTTPS Proxy
resource "google_compute_target_https_proxy" "aangan_https_proxy" {
  name             = "aangan-https-proxy"
  url_map          = google_compute_url_map.aangan_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.aangan_ssl.id]
}

# HTTP to HTTPS Redirect
resource "google_compute_url_map" "aangan_https_redirect" {
  name = "aangan-https-redirect"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query           = false
  }
}

resource "google_compute_target_http_proxy" "aangan_http_proxy" {
  name    = "aangan-http-proxy"
  url_map = google_compute_url_map.aangan_https_redirect.id
}

# Global Forwarding Rules
resource "google_compute_global_forwarding_rule" "aangan_https_forwarding_rule" {
  name       = "aangan-https-forwarding-rule"
  target     = google_compute_target_https_proxy.aangan_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.aangan_ip.address
}

resource "google_compute_global_forwarding_rule" "aangan_http_forwarding_rule" {
  name       = "aangan-http-forwarding-rule"
  target     = google_compute_target_http_proxy.aangan_http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.aangan_ip.address
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "aangan-cloud-run-sa"
  display_name = "Aangan Cloud Run Service Account"
  description  = "Service account for Aangan Cloud Run services"
}

# IAM bindings for service account
resource "google_project_iam_member" "cloud_run_sa_bindings" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor",
    "roles/cloudsql.client"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Secret Manager Secrets
resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "jwt_access_secret" {
  secret_id = "jwt-access-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "jwt_refresh_secret" {
  secret_id = "jwt-refresh-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "sentry_dsn" {
  secret_id = "sentry-dsn"
  
  replication {
    auto {}
  }
}

# Add secret versions (these will be managed separately for security)
resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = var.database_url
}

resource "google_secret_manager_secret_version" "jwt_access_secret" {
  secret      = google_secret_manager_secret.jwt_access_secret.id
  secret_data = var.jwt_access_secret
}

resource "google_secret_manager_secret_version" "jwt_refresh_secret" {
  secret      = google_secret_manager_secret.jwt_refresh_secret.id
  secret_data = var.jwt_refresh_secret
}

resource "google_secret_manager_secret_version" "sentry_dsn" {
  secret      = google_secret_manager_secret.sentry_dsn.id
  secret_data = var.sentry_dsn
}

# Cloud Armor Security Policy
resource "google_compute_security_policy" "aangan_security_policy" {
  name        = "aangan-security-policy"
  description = "Security policy for Aangan application"

  rule {
    action   = "allow"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Allow all traffic by default"
  }

  rule {
    action   = "deny(403)"
    priority = "900"
    match {
      expr {
        expression = "origin.region_code == 'CN'"
      }
    }
    description = "Block traffic from China"
  }

  rule {
    action   = "rate_based_ban"
    priority = "800"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "Rate limiting rule"
  }
}

# Apply security policy to backend service
resource "google_compute_backend_service" "aangan_backend_with_security" {
  name                  = google_compute_backend_service.aangan_backend.name
  protocol              = google_compute_backend_service.aangan_backend.protocol
  port_name             = google_compute_backend_service.aangan_backend.port_name
  timeout_sec           = google_compute_backend_service.aangan_backend.timeout_sec
  enable_cdn           = google_compute_backend_service.aangan_backend.enable_cdn
  load_balancing_scheme = google_compute_backend_service.aangan_backend.load_balancing_scheme
  security_policy      = google_compute_security_policy.aangan_security_policy.id

  dynamic "backend" {
    for_each = google_compute_backend_service.aangan_backend.backend
    content {
      group           = backend.value.group
      balancing_mode  = backend.value.balancing_mode
      capacity_scaler = backend.value.capacity_scaler
    }
  }

  health_checks = google_compute_backend_service.aangan_backend.health_checks

  log_config {
    enable = true
    sample_rate = 1.0
  }
}

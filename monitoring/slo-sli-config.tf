# monitoring/slo-sli-config.tf
# SLO/SLI Configuration for Aangan Production Monitoring

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.84"
    }
  }
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "notification_email" {
  description = "Email for notifications"
  type        = string
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerts"
  type        = string
  default     = ""
}

variable "pagerduty_integration_key" {
  description = "PagerDuty integration key"
  type        = string
  default     = ""
  sensitive   = true
}

# Notification Channels
resource "google_monitoring_notification_channel" "email" {
  display_name = "Aangan Production Email Alerts"
  type         = "email"
  
  labels = {
    email_address = var.notification_email
  }
  
  enabled = true
}

resource "google_monitoring_notification_channel" "slack" {
  count        = var.slack_webhook_url != "" ? 1 : 0
  display_name = "Aangan Production Slack Alerts"
  type         = "slack"
  
  labels = {
    url = var.slack_webhook_url
  }
  
  enabled = true
}

resource "google_monitoring_notification_channel" "pagerduty" {
  count        = var.pagerduty_integration_key != "" ? 1 : 0
  display_name = "Aangan Production PagerDuty"
  type         = "pagerduty"
  
  labels = {
    service_key = var.pagerduty_integration_key
  }
  
  enabled = true
}

# SLI Metrics Definitions

# 1. Availability SLI - HTTP Request Success Rate
resource "google_monitoring_sli" "availability_sli" {
  service      = google_monitoring_custom_service.aangan_service.service_id
  sli_id       = "availability-sli"
  display_name = "Availability SLI"

  request_based_sli {
    distribution_cut {
      distribution_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_latencies\""
      ])

      range {
        min = 0
        max = 30000  # 30 seconds
      }
    }

    good_total_ratio {
      good_service_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_count\"",
        "metric.labels.response_code_class=\"2xx\""
      ])

      total_service_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_count\""
      ])
    }
  }
}

# 2. Latency SLI - Response Time Performance
resource "google_monitoring_sli" "latency_sli" {
  service      = google_monitoring_custom_service.aangan_service.service_id
  sli_id       = "latency-sli"
  display_name = "Latency SLI"

  request_based_sli {
    distribution_cut {
      distribution_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_latencies\""
      ])

      range {
        min = 0
        max = 2000  # 2 seconds for 95th percentile
      }
    }
  }
}

# 3. Error Rate SLI
resource "google_monitoring_sli" "error_rate_sli" {
  service      = google_monitoring_custom_service.aangan_service.service_id
  sli_id       = "error-rate-sli"
  display_name = "Error Rate SLI"

  request_based_sli {
    good_total_ratio {
      good_service_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_count\"",
        "metric.labels.response_code_class!=\"5xx\""
      ])

      total_service_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_count\""
      ])
    }
  }
}

# Custom Service Definition
resource "google_monitoring_custom_service" "aangan_service" {
  service_id   = "aangan-production-service"
  display_name = "Aangan Production Service"
  
  telemetry {
    resource_name = "//run.googleapis.com/projects/${var.project_id}/locations/us-central1/services/aangan-backend-blue"
  }
  
  telemetry {
    resource_name = "//run.googleapis.com/projects/${var.project_id}/locations/us-central1/services/aangan-backend-green"
  }
}

# SLO Definitions

# 1. Availability SLO - 99.5% uptime
resource "google_monitoring_slo" "availability_slo" {
  service      = google_monitoring_custom_service.aangan_service.service_id
  slo_id       = "availability-slo"
  display_name = "99.5% Availability SLO"

  goal                = 0.995  # 99.5%
  calendar_period     = "MONTH"
  service_level_indicator {
    request_based {
      distribution_cut {
        distribution_filter = join(" AND ", [
          "resource.type=\"cloud_run_revision\"",
          "resource.labels.service_name=~\"aangan-backend-.*\"",
          "metric.type=\"run.googleapis.com/request_latencies\""
        ])

        range {
          min = 0
          max = 30000  # 30 seconds timeout
        }
      }
    }
  }
}

# 2. Latency SLO - 95% of requests under 2s
resource "google_monitoring_slo" "latency_slo" {
  service      = google_monitoring_custom_service.aangan_service.service_id
  slo_id       = "latency-slo"
  display_name = "95% Requests Under 2s SLO"

  goal                = 0.95   # 95%
  calendar_period     = "DAY"
  service_level_indicator {
    request_based {
      distribution_cut {
        distribution_filter = join(" AND ", [
          "resource.type=\"cloud_run_revision\"",
          "resource.labels.service_name=~\"aangan-backend-.*\"",
          "metric.type=\"run.googleapis.com/request_latencies\""
        ])

        range {
          min = 0
          max = 2000  # 2 seconds
        }
      }
    }
  }
}

# 3. Error Rate SLO - 99% success rate
resource "google_monitoring_slo" "error_rate_slo" {
  service      = google_monitoring_custom_service.aangan_service.service_id
  slo_id       = "error-rate-slo"
  display_name = "99% Success Rate SLO"

  goal                = 0.99   # 99%
  calendar_period     = "DAY"
  service_level_indicator {
    request_based {
      good_total_ratio {
        good_service_filter = join(" AND ", [
          "resource.type=\"cloud_run_revision\"",
          "resource.labels.service_name=~\"aangan-backend-.*\"",
          "metric.type=\"run.googleapis.com/request_count\"",
          "metric.labels.response_code_class!=\"5xx\""
        ])

        total_service_filter = join(" AND ", [
          "resource.type=\"cloud_run_revision\"",
          "resource.labels.service_name=~\"aangan-backend-.*\"",
          "metric.type=\"run.googleapis.com/request_count\""
        ])
      }
    }
  }
}

# Alert Policies

# 1. SLO Burn Rate Alert - Availability
resource "google_monitoring_alert_policy" "availability_burn_rate" {
  display_name = "Aangan Availability SLO Burn Rate"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Availability SLO burn rate too high"
    
    condition_threshold {
      filter          = "select_slo_burn_rate(\"projects/${var.project_id}/services/${google_monitoring_custom_service.aangan_service.service_id}/serviceLevelObjectives/${google_monitoring_slo.availability_slo.slo_id}\")"
      duration        = "300s"  # 5 minutes
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 10      # 10x burn rate

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  conditions {
    display_name = "Availability SLO burn rate critically high"
    
    condition_threshold {
      filter          = "select_slo_burn_rate(\"projects/${var.project_id}/services/${google_monitoring_custom_service.aangan_service.service_id}/serviceLevelObjectives/${google_monitoring_slo.availability_slo.slo_id}\")"
      duration        = "60s"   # 1 minute
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 100     # 100x burn rate

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = concat(
    [google_monitoring_notification_channel.email.id],
    var.slack_webhook_url != "" ? [google_monitoring_notification_channel.slack[0].id] : [],
    var.pagerduty_integration_key != "" ? [google_monitoring_notification_channel.pagerduty[0].id] : []
  )

  alert_strategy {
    auto_close = "1800s"  # 30 minutes
  }

  documentation {
    content = "Availability SLO burn rate is too high. This indicates that error rates are consuming error budget faster than sustainable."
    mime_type = "text/markdown"
  }
}

# 2. Latency Alert
resource "google_monitoring_alert_policy" "latency_alert" {
  display_name = "Aangan High Latency"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "95th percentile latency too high"
    
    condition_threshold {
      filter         = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_latencies\""
      ])
      duration       = "300s"  # 5 minutes
      comparison     = "COMPARISON_GREATER_THAN"
      threshold_value = 5000   # 5 seconds

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
        group_by_fields      = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = concat(
    [google_monitoring_notification_channel.email.id],
    var.slack_webhook_url != "" ? [google_monitoring_notification_channel.slack[0].id] : []
  )

  documentation {
    content = "Application latency is higher than acceptable thresholds. Check for performance issues or scaling requirements."
    mime_type = "text/markdown"
  }
}

# 3. Error Rate Alert
resource "google_monitoring_alert_policy" "error_rate_alert" {
  display_name = "Aangan High Error Rate"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "5xx error rate too high"
    
    condition_threshold {
      filter         = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/request_count\"",
        "metric.labels.response_code_class=\"5xx\""
      ])
      duration       = "300s"  # 5 minutes
      comparison     = "COMPARISON_GREATER_THAN"
      threshold_value = 10     # 10 errors in 5 minutes

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = concat(
    [google_monitoring_notification_channel.email.id],
    var.slack_webhook_url != "" ? [google_monitoring_notification_channel.slack[0].id] : [],
    var.pagerduty_integration_key != "" ? [google_monitoring_notification_channel.pagerduty[0].id] : []
  )

  documentation {
    content = "High 5xx error rate detected. This may indicate application issues or infrastructure problems."
    mime_type = "text/markdown"
  }
}

# 4. Memory Usage Alert
resource "google_monitoring_alert_policy" "memory_alert" {
  display_name = "Aangan High Memory Usage"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Memory utilization too high"
    
    condition_threshold {
      filter         = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/container/memory/utilizations\""
      ])
      duration       = "600s"  # 10 minutes
      comparison     = "COMPARISON_GREATER_THAN"
      threshold_value = 0.8    # 80%

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content = "Memory usage is high. Consider scaling up or investigating memory leaks."
    mime_type = "text/markdown"
  }
}

# 5. CPU Usage Alert
resource "google_monitoring_alert_policy" "cpu_alert" {
  display_name = "Aangan High CPU Usage"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "CPU utilization too high"
    
    condition_threshold {
      filter         = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/container/cpu/utilizations\""
      ])
      duration       = "600s"  # 10 minutes
      comparison     = "COMPARISON_GREATER_THAN"
      threshold_value = 0.8    # 80%

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content = "CPU usage is high. Consider scaling up or investigating performance issues."
    mime_type = "text/markdown"
  }
}

# 6. Instance Count Alert
resource "google_monitoring_alert_policy" "instance_count_alert" {
  display_name = "Aangan Instance Count Anomaly"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "No active instances"
    
    condition_threshold {
      filter         = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/container/instance_count\""
      ])
      duration       = "300s"  # 5 minutes
      comparison     = "COMPARISON_EQUAL"
      threshold_value = 0

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  conditions {
    display_name = "Too many instances"
    
    condition_threshold {
      filter         = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=~\"aangan-backend-.*\"",
        "metric.type=\"run.googleapis.com/container/instance_count\""
      ])
      duration       = "900s"  # 15 minutes
      comparison     = "COMPARISON_GREATER_THAN"
      threshold_value = 50     # 50 instances

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  notification_channels = concat(
    [google_monitoring_notification_channel.email.id],
    var.pagerduty_integration_key != "" ? [google_monitoring_notification_channel.pagerduty[0].id] : []
  )

  documentation {
    content = "Instance count is outside normal ranges. Check for scaling issues or unexpected traffic patterns."
    mime_type = "text/markdown"
  }
}

# WebSocket Specific Monitoring (Custom Metrics)
resource "google_monitoring_metric_descriptor" "websocket_connections" {
  type        = "custom.googleapis.com/aangan/websocket_connections"
  metric_kind = "GAUGE"
  value_type  = "INT64"
  description = "Number of active WebSocket connections"
  
  labels {
    key         = "service_name"
    value_type  = "STRING"
    description = "Name of the service"
  }
  
  labels {
    key         = "environment"
    value_type  = "STRING"
    description = "Environment (blue/green)"
  }
}

resource "google_monitoring_metric_descriptor" "websocket_messages" {
  type        = "custom.googleapis.com/aangan/websocket_messages"
  metric_kind = "CUMULATIVE"
  value_type  = "INT64"
  description = "Number of WebSocket messages sent/received"
  
  labels {
    key         = "service_name"
    value_type  = "STRING"
    description = "Name of the service"
  }
  
  labels {
    key         = "direction"
    value_type  = "STRING"
    description = "Message direction (sent/received)"
  }
  
  labels {
    key         = "message_type"
    value_type  = "STRING"
    description = "Type of WebSocket message"
  }
}

# WebSocket Connection Alert
resource "google_monitoring_alert_policy" "websocket_connection_alert" {
  display_name = "Aangan WebSocket Connection Issues"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Low WebSocket connection count"
    
    condition_threshold {
      filter         = "metric.type=\"custom.googleapis.com/aangan/websocket_connections\""
      duration       = "600s"  # 10 minutes
      comparison     = "COMPARISON_LESS_THAN"
      threshold_value = 5      # Less than 5 connections for 10 minutes

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content = "WebSocket connections are unusually low. Check for connectivity issues or user experience problems."
    mime_type = "text/markdown"
  }
}

# Dashboard Creation
resource "google_monitoring_dashboard" "aangan_main_dashboard" {
  dashboard_json = jsonencode({
    displayName = "Aangan Production Dashboard"
    mosaicLayout = {
      tiles = [
        {
          width = 6
          height = 4
          widget = {
            title = "Request Rate"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"aangan-backend-.*\" AND metric.type=\"run.googleapis.com/request_count\""
                      aggregation = {
                        alignmentPeriod = "60s"
                        perSeriesAligner = "ALIGN_RATE"
                        crossSeriesReducer = "REDUCE_SUM"
                        groupByFields = ["resource.labels.service_name"]
                      }
                    }
                  }
                  plotType = "LINE"
                }
              ]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Requests/sec"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width = 6
          height = 4
          xPos = 6
          widget = {
            title = "Response Latency (95th percentile)"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"aangan-backend-.*\" AND metric.type=\"run.googleapis.com/request_latencies\""
                      aggregation = {
                        alignmentPeriod = "60s"
                        perSeriesAligner = "ALIGN_DELTA"
                        crossSeriesReducer = "REDUCE_PERCENTILE_95"
                        groupByFields = ["resource.labels.service_name"]
                      }
                    }
                  }
                  plotType = "LINE"
                }
              ]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Latency (ms)"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width = 6
          height = 4
          yPos = 4
          widget = {
            title = "Error Rate"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"aangan-backend-.*\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\""
                      aggregation = {
                        alignmentPeriod = "60s"
                        perSeriesAligner = "ALIGN_RATE"
                        crossSeriesReducer = "REDUCE_SUM"
                        groupByFields = ["resource.labels.service_name"]
                      }
                    }
                  }
                  plotType = "LINE"
                }
              ]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Errors/sec"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width = 6
          height = 4
          xPos = 6
          yPos = 4
          widget = {
            title = "Instance Count"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"aangan-backend-.*\" AND metric.type=\"run.googleapis.com/container/instance_count\""
                      aggregation = {
                        alignmentPeriod = "60s"
                        perSeriesAligner = "ALIGN_MEAN"
                        crossSeriesReducer = "REDUCE_SUM"
                        groupByFields = ["resource.labels.service_name"]
                      }
                    }
                  }
                  plotType = "LINE"
                }
              ]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Instances"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width = 6
          height = 4
          yPos = 8
          widget = {
            title = "Memory Utilization"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"aangan-backend-.*\" AND metric.type=\"run.googleapis.com/container/memory/utilizations\""
                      aggregation = {
                        alignmentPeriod = "60s"
                        perSeriesAligner = "ALIGN_MEAN"
                        crossSeriesReducer = "REDUCE_MEAN"
                        groupByFields = ["resource.labels.service_name"]
                      }
                    }
                  }
                  plotType = "LINE"
                }
              ]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Utilization (%)"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width = 6
          height = 4
          xPos = 6
          yPos = 8
          widget = {
            title = "CPU Utilization"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"aangan-backend-.*\" AND metric.type=\"run.googleapis.com/container/cpu/utilizations\""
                      aggregation = {
                        alignmentPeriod = "60s"
                        perSeriesAligner = "ALIGN_MEAN"
                        crossSeriesReducer = "REDUCE_MEAN"
                        groupByFields = ["resource.labels.service_name"]
                      }
                    }
                  }
                  plotType = "LINE"
                }
              ]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Utilization (%)"
                scale = "LINEAR"
              }
            }
          }
        }
      ]
    }
  })
}

# SLO Dashboard
resource "google_monitoring_dashboard" "aangan_slo_dashboard" {
  dashboard_json = jsonencode({
    displayName = "Aangan SLO Dashboard"
    mosaicLayout = {
      tiles = [
        {
          width = 12
          height = 6
          widget = {
            title = "SLO Overview"
            scorecard = {
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "select_slo_compliance(\"projects/${var.project_id}/services/${google_monitoring_custom_service.aangan_service.service_id}/serviceLevelObjectives/${google_monitoring_slo.availability_slo.slo_id}\")"
                  aggregation = {
                    alignmentPeriod = "300s"
                    perSeriesAligner = "ALIGN_MEAN"
                  }
                }
              }
              sparkChartView = {
                sparkChartType = "SPARK_LINE"
              }
              gaugeView = {
                lowerBound = 0.0
                upperBound = 1.0
              }
            }
          }
        }
      ]
    }
  })
}

# Outputs
output "monitoring_dashboard_url" {
  description = "URL to the main monitoring dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.aangan_main_dashboard.id}?project=${var.project_id}"
}

output "slo_dashboard_url" {
  description = "URL to the SLO dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.aangan_slo_dashboard.id}?project=${var.project_id}"
}

output "notification_channels" {
  description = "Created notification channels"
  value = {
    email = google_monitoring_notification_channel.email.id
    slack = var.slack_webhook_url != "" ? google_monitoring_notification_channel.slack[0].id : null
    pagerduty = var.pagerduty_integration_key != "" ? google_monitoring_notification_channel.pagerduty[0].id : null
  }
}

output "slo_ids" {
  description = "SLO IDs for reference"
  value = {
    availability = google_monitoring_slo.availability_slo.slo_id
    latency      = google_monitoring_slo.latency_slo.slo_id
    error_rate   = google_monitoring_slo.error_rate_slo.slo_id
  }
}

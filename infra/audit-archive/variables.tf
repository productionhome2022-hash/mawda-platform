variable "project_id" {
  description = "GCP project hosting the Mawdda audit archive."
  type        = string
}

variable "bucket_name" {
  description = "Globally unique, dedicated audit archive bucket name."
  type        = string
}

variable "location" {
  description = "Approved GCS data-residency location; deliberately required with no default."
  type        = string
}

variable "runtime_service_account" {
  description = "Cloud Functions runtime service account used by archiveOwnerReviewAuditLogs."
  type        = string
}

variable "retention_seconds" {
  description = "Minimum locked retention; 63,072,000 seconds is approximately 24 months."
  type        = number
  default     = 63072000

  validation {
    condition     = var.retention_seconds >= 63072000
    error_message = "Audit retention must be at least 24 months (63,072,000 seconds)."
  }
}

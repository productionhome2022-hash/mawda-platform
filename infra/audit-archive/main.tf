terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
}

resource "google_storage_bucket" "owner_audit_archive" {
  name                        = var.bucket_name
  project                     = var.project_id
  location                    = var.location
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false

  versioning {
    enabled = true
  }

  retention_policy {
    retention_period = var.retention_seconds
  }

  lifecycle {
    prevent_destroy = true
  }

  labels = {
    purpose     = "mawdda-owner-audit-archive"
    data_class  = "restricted"
    retention   = "24-months"
    managed_by  = "terraform"
  }
}

resource "google_storage_bucket_iam_member" "archive_writer" {
  bucket = google_storage_bucket.owner_audit_archive.name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${var.runtime_service_account}"
}

resource "google_storage_bucket_iam_member" "archive_reader" {
  bucket = google_storage_bucket.owner_audit_archive.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${var.runtime_service_account}"
}

resource "google_storage_bucket_iam_member" "bucket_metadata_reader" {
  bucket = google_storage_bucket.owner_audit_archive.name
  role   = "roles/storage.bucketViewer"
  member = "serviceAccount:${var.runtime_service_account}"
}

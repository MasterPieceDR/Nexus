terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Genera un ID aleatorio para evitar conflictos con los nombres de los buckets de S3
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

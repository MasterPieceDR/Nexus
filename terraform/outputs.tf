output "cloudfront_url" {
  description = "URL publica del Frontend (CloudFront)"
  value       = aws_cloudfront_distribution.frontend_cdn.domain_name
}

output "backend_url" {
  description = "URL publica del Backend API (EC2)"
  value       = "http://${aws_instance.backend.public_ip}:8000"
}

output "media_bucket_name" {
  description = "Nombre del bucket S3 de Media"
  value       = aws_s3_bucket.media_bucket.id
}

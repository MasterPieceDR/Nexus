output "app_bucket_name" {
  value = aws_s3_bucket.app.bucket
}

output "media_bucket_name" {
  value = aws_s3_bucket.media.bucket
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.app.domain_name}"
}

output "api_public_ip" {
  value = aws_instance.api.public_ip
}

output "api_public_dns" {
  value = aws_instance.api.public_dns
}

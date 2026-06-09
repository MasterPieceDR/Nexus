variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "pincloud"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "bucket_suffix" {
  type    = string
  default = "diego"
}

variable "media_allowed_origins" {
  type = list(string)
  default = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ]
}

variable "my_ip" {
  type = string
}

variable "public_key_path" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "aws_region" {
  description = "Región de AWS donde se desplegará la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre base para los recursos del proyecto"
  type        = string
  default     = "nexus-app"
}

variable "db_password" {
  description = "Contraseña para la base de datos SQL Server"
  type        = string
  sensitive   = true
  default     = "NexusAdmin123!" # En producción, no usar un default aquí
}

variable "jwt_secret_key" {
  description = "Clave secreta para firmar los JWT"
  type        = string
  sensitive   = true
  default     = "nexus_super_secret_key_change_me_in_prod"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t2.micro" # t2.micro es elegible para la capa gratuita (Free Tier)
}

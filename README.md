# Pinterest Fullstack

Aplicación web multimedia tipo Pinterest usando HTML, CSS, JavaScript vanilla, FastAPI, SQL Server, AWS S3, EC2, IAM y Terraform.

## Estructura

```txt
pincloud_fullstack/
├── front/
│   ├── html/
│   ├── estilos/
│   ├── javascript/
│   └── assets/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── rutas/
│   │   ├── esquemas/
│   │   ├── seguridad/
│   │   └── services/
│   ├── sql/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── infra/
│   ├── providers.tf
│   ├── variables.tf
│   ├── s3.tf
│   ├── iam.tf
│   ├── ec2.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── scripts/
└── docker-compose.yml
```

## Ejecución local

### 1. Crear base de datos SQL Server

Ejecuta `backend/sql/init.sql` en SQL Server Management Studio.

También puedes levantar SQL Server con Docker:

```bash
docker compose up -d
```

Después ejecuta el script SQL contra el servidor local.

### 2. Configurar variables del backend

Copia el archivo:

```bash
cp backend/.env.example backend/.env
```

En Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edita `backend/.env` y coloca tu bucket real de S3 en `AWS_MEDIA_BUCKET`.

### 3. Ejecutar backend

Linux o macOS:

```bash
./scripts/run_backend_local.sh
```

Windows PowerShell:

```powershell
.\scripts\run_backend_local.ps1
```

La API se abre en:

```txt
http://127.0.0.1:8000/docs
```

### 4. Ejecutar frontend

Abre la carpeta `front` con Live Server en VS Code o ejecuta:

```bash
cd front
python -m http.server 5500
```

Luego abre:

```txt
http://127.0.0.1:5500/html/index.html
```

## Terraform AWS

### 1. Crear llave SSH

Windows PowerShell:

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\pincloud_ec2"
```

### 2. Obtener IP pública

```powershell
(Invoke-WebRequest -UseBasicParsing https://checkip.amazonaws.com).Content.Trim()
```

### 3. Crear variables Terraform

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

Edita `infra/terraform.tfvars` con tu IP y ruta de llave pública.

### 4. Levantar infraestructura

```bash
cd infra
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

Terraform crea:

```txt
Bucket privado para aplicación frontend
Bucket privado para multimedia
CloudFront para servir la aplicación
IAM Role para EC2
Política IAM de mínimo privilegio sobre el bucket multimedia
EC2 para la API FastAPI
Security Group para HTTP, SSH y FastAPI controlado
```

### 5. Subir frontend al bucket principal

Desde la raíz del proyecto:

```bash
./scripts/deploy_front.sh nombre-del-bucket-app
```

El nombre del bucket sale en `terraform output app_bucket_name`.

## Flujo de la aplicación

```txt
Usuario abre el frontend desde CloudFront o local
El frontend consume la API FastAPI
FastAPI se conecta a SQL Server
FastAPI genera URLs prefirmadas para S3
El navegador sube imágenes o videos al bucket multimedia
SQL Server guarda metadatos de publicaciones
El feed muestra publicaciones aprobadas
```

## Buenas prácticas aplicadas

```txt
Frontend separado por html, estilos y javascript
Variables globales de CSS
Backend organizado por modelos, rutas, esquemas, seguridad y servicios
Contraseñas con hash bcrypt
Autenticación con JWT
CORS controlado por variables de entorno
S3 privado
CloudFront para bucket de aplicación
IAM Role para EC2 sin credenciales quemadas en código
Política IAM de mínimo privilegio
Terraform para infraestructura reproducible
SQL Server separado del almacenamiento multimedia
```
posdata:solo es la version 1, aun falta definir bien la base de datos y los script de terraform para aws
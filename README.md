# Nexus — Plataforma Visual de Conocimiento

Nexus es una red visual de conocimiento para descubrir, guardar y compartir ideas sobre tecnología, diseño y ciencia. Cuenta con moderación ética, arquitectura desacoplada, autenticación OAuth2 (Google / GitHub / LDAP), panel de administración completo e infraestructura en AWS lista para producción.

> **Proyecto Final** — Ruiz & Vivas

---

## Estructura del Proyecto

```
Nexus/
├── backend/                  # API RESTful en FastAPI (Python)
│   ├── app/
│   │   ├── rutas/            # Endpoints: pins, media, auth, admin, ratings…
│   │   ├── db/               # Conexión pyodbc a SQL Server
│   │   ├── seguridad/        # JWT, OAuth2, dependencias de autenticación
│   │   └── services/         # Moderación IA/OCR, WhatsApp, cloud storage
│   ├── sql/                  # Scripts T-SQL (01_schema → 07_nexus_v3_upgrade)
│   ├── static/
│   │   ├── seed/images/      # 60 imágenes WebP de contenido seed incluidas
│   │   └── uploads/          # Uploads de usuarios (imágenes, avatares, vídeos)
│   ├── requirements.txt
│   └── .env.example          # Plantilla de variables de entorno
├── frontend/                 # SPA React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Navbar, MasonryGrid, PinCard, Modales…
│   │   ├── pages/            # Feed, Landing, Login, Registro, Perfil, Admin
│   │   ├── services/api.js   # Capa de comunicación con el backend
│   │   └── contexts/         # ThemeContext, SidebarContext
│   ├── index.html
│   ├── vite.config.js
│   └── .env.example
├── terraform/                # IaC para AWS (Free Tier compatible)
│   ├── main.tf / networking.tf / compute.tf / storage.tf
│   ├── variables.tf / outputs.tf
│   └── user_data.sh          # Bootstrap automático de EC2
├── scripts/                  # Helpers de despliegue
│   ├── deploy_front.sh       # Build + sync a S3
│   └── run_backend_local.sh  # Inicio rápido local
└── docker-compose.yml        # SQL Server Express en Docker (desarrollo local)
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Lucide React, Framer Motion |
| Backend | Python 3.12, FastAPI, pyodbc (T-SQL sin ORM) |
| Base de datos | Microsoft SQL Server 2022 |
| Auth | JWT, Google OAuth2, GitHub OAuth, LDAP corporativo |
| Cloud | AWS EC2, S3, CloudFront, IAM — aprovisionado con Terraform |
| Moderación | Mock / Google Vision / AWS Rekognition / Hugging Face NSFW |
| Mensajería | Mock / Twilio WhatsApp |

---

## Configuración Local (Desarrollo)

### Requisitos previos

- Docker Desktop
- Python 3.12+
- Node.js 20+
- [ODBC Driver 18 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

### 1. Clonar el repositorio

```bash
git clone https://github.com/MasterPieceDR/Nexus.git
cd Nexus
```

### 2. Base de datos — SQL Server en Docker

```bash
docker compose up -d
```

Espera ~30 segundos a que SQL Server arranque y luego ejecuta los scripts en orden:

```bash
# Con sqlcmd o Azure Data Studio, conecta a localhost:1433 con SA / PasswordSeguro123!
# y ejecuta los archivos de backend/sql/ en este orden:
01_schema.sql
02_seed_data.sql
03_stored_procedures.sql
04_triggers.sql
05_permissions.sql
06_nexus_v2_upgrade.sql
07_nexus_v3_upgrade.sql
```

> La migración `07_nexus_v3_upgrade.sql` es **idempotente**: añade tablas, procedimientos y campos nuevos sin destruir datos existentes.

### 3. Backend — FastAPI

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # edita las variables según tu entorno
uvicorn app.main:app --reload
```

La API queda disponible en `http://localhost:8000`. Documentación interactiva en `http://localhost:8000/docs`.

### 4. Frontend — React + Vite

```bash
cd frontend
npm install
cp .env.example .env   # ajusta VITE_API_URL si es necesario
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### 5. Seed de imágenes

Las 60 imágenes WebP de contenido seed ya están incluidas en `backend/static/seed/images/`. Para poblar la base de datos con contenido de demostración:

```bash
cd backend
python seed.py
```

---

## Despliegue en AWS con Terraform

La infraestructura está optimizada para el **Free Tier** de AWS (t2.micro, 30 GB EBS, S3 estándar, CloudFront).

### Arquitectura

```
Usuarios ──► CloudFront CDN ──► S3 (frontend React build)
                                │
                                └──► EC2 t2.micro (FastAPI + Docker SQL Server)
                                          │
                                          └──► S3 (media uploads)
```

### Prerrequisitos

1. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configurado (`aws configure`)
2. [Terraform](https://developer.hashicorp.com/terraform/downloads) ≥ 1.5

### Paso 1 — Aprovisionar infraestructura

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Al terminar, Terraform imprime tres valores — guárdalos:

```
cloudfront_url   = "xxxxxxxx.cloudfront.net"
backend_url      = "http://<ip-ec2>:8000"
media_bucket_name = "nexus-media-xxxx"
```

> **Nota:** El script `user_data.sh` clona automáticamente este repositorio en `/opt/nexus`, instala las dependencias Python y lanza la API como servicio systemd. La primera ejecución tarda ~5 minutos.

### Paso 2 — Configurar el backend en EC2

Conéctate a la instancia por SSH y edita el archivo `.env` con tus credenciales reales:

```bash
ssh -i tu-clave.pem ubuntu@<ip-ec2>
sudo nano /opt/nexus/backend/.env
```

Variables mínimas para producción:

```env
APP_ENV=production
APP_HOST=0.0.0.0
JWT_SECRET_KEY=<genera_una_clave_de_64_chars>
CLOUD_PROVIDER=S3
AWS_MEDIA_BUCKET=nexus-media-xxxx   # el valor de media_bucket_name
AWS_REGION=us-east-1
```

Reinicia el servicio:

```bash
sudo systemctl restart nexus-api
sudo systemctl status nexus-api
```

Ejecuta los scripts SQL contra el SQL Server en Docker:

```bash
docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U SA -P 'PasswordSeguro123!' -C \
  -i /opt/nexus/backend/sql/01_schema.sql
# repite para 02 → 07
```

### Paso 3 — Poblar con imágenes seed

```bash
cd /opt/nexus/backend
source .venv/bin/activate
python seed.py
```

### Paso 4 — Compilar y subir el frontend a S3

Desde tu máquina local (o desde CI/CD):

```bash
cd frontend

# Ajusta la URL del backend en el .env de producción
echo "VITE_API_URL=http://<ip-ec2>:8000" > .env.production

npm run build

# Sube el build al bucket del frontend
aws s3 sync dist/ s3://$(cd ../terraform && terraform output -raw media_bucket_name)-frontend/ \
  --delete --cache-control "public,max-age=31536000,immutable"

# O usa el script incluido
cd ../scripts && bash deploy_front.sh
```

Accede al proyecto desde la `cloudfront_url` retornada por Terraform.

---

## Variables de Entorno

Copia los archivos de ejemplo y completa solo los valores que necesitas:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Grupo | Variable | Descripción | Default sin credenciales |
|---|---|---|---|
| App | `APP_ENV` | `development` / `production` | `development` |
| BD | `DB_SERVER`, `DB_USER`, `DB_PASSWORD` | SQL Server | `localhost` / `SA` / `PasswordSeguro123!` |
| JWT | `JWT_SECRET_KEY` | Clave secreta de tokens | **Obligatoria** |
| OAuth | `GOOGLE_CLIENT_ID/SECRET` | Login con Google | Desactiva el botón de Google |
| Cloud | `CLOUD_PROVIDER` | `LOCAL` / `S3` / `CLOUDINARY` | `LOCAL` → guarda en `backend/static/` |
| Moderación | `MODERATION_PROVIDER` | `MOCK` / `GOOGLE_VISION` / `HF_NSFW` | `MOCK` → todo en PENDING |
| WhatsApp | `WHATSAPP_PROVIDER` | `MOCK` / `TWILIO` | `MOCK` → registra en logs |
| Frontend | `VITE_API_URL` | URL del backend | Autodetecta `localhost:8000` |

---

## Características Principales

- **Feed masonry** con galería de profundidad animada en el hero
- **Autenticación múltiple**: email/contraseña, Google OAuth2, GitHub OAuth, LDAP corporativo
- **Modos de feed**: General y Para Ti (feed personalizado por intereses)
- **Filtros**: categoría, verificación, ordenamiento por recientes/populares, búsqueda full-text
- **Moderación ética**: estados PENDING → APPROVED / REJECTED / HIDDEN, reportes por nodo
- **Verificación de información**: flujo UNVERIFIED → VERIFIED con sello visual
- **Panel Admin** (`/admin`): métricas, moderación, reportes, validaciones IA, usuarios, auditoría
- **Dark mode** completo, responsive mobile-first
- **Optimización de imágenes**: endpoint `/api/media/thumb` con caché en disco, WebP, dimensiones variables
- **Seguridad**: CSP estricta, CSRF protection, roles RBAC en base de datos

---

## Validación y Hooks (Husky)

```bash
# Desde la raíz del proyecto
npm install       # instala Husky
npm run validate  # lint + build del frontend
```

El hook `pre-commit` ejecuta `lint` y `build` automáticamente antes de cada commit.

---

## Licencia

Proyecto académico — Ruiz & Vivas, 2025.

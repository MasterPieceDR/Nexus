# Nexus - Plataforma Visual de Conocimiento

Nexus es una plataforma visual diseñada para descubrir, conectar y organizar ideas, proyectos y referencias. Orientada a la tecnología, diseño y ciencia, no es simplemente un "clon de Pinterest", sino una red estructurada de conocimiento visual con moderación ética.

## 🚀 Características Principales
- **Autenticación Segura:** Sistema propio (JWT) + Inicio de Sesión de Google.
- **Mosaico Visual (Masonry):** Visualización tipo cascada fluida con CSS Vanilla.
- **Subida de Multimedia Cloud:** Integración directa con AWS S3 mediante Pre-signed URLs para imágenes y videos (MP4).
- **Sistema de Moderación Ética:** Los nodos (publicaciones) requieren aprobación manual de un administrador para ser públicos. Los usuarios pueden declarar contenido generado con IA o contenido sensible.
- **Roles y Permisos:** `nexus_api_user` restringe el acceso al backend únicamente a procedimientos almacenados en SQL Server, protegiendo las tablas contra inyecciones y ataques.

## 🛠️ Stack Tecnológico
- **Frontend:** Vanilla JS, CSS3 Variables, HTML5 Semántico.
- **Backend:** FastAPI (Python), `pyodbc` (sin ORM, consultas T-SQL directas), Google Auth, Boto3.
- **Base de Datos:** Microsoft SQL Server.
- **Infraestructura:** AWS S3, AWS IAM.

## ⚙️ Estructura del Proyecto
- `backend/`: Código de FastAPI, configuraciones y endpoints RESTful (`/api/*`).
- `backend/sql/`: Scripts transaccionales de base de datos (`01_schema.sql` al `05_permissions.sql`).
- `front/`: Vistas de usuario.
  - `html/`: Páginas (Explorar, Modales, Autenticación).
  - `estilos/`: CSS modular (`base.css`, `layout.css`, `components.css`, específicos de cada página).
  - `javascript/`: Controladores Vanilla JS (`api.js`, `ui.js`, `modal.js`, vistas específicas).

## 🚀 Configuración e Instalación
1. Ejecuta el archivo `01_schema.sql` y subsecuentes en tu instancia local de SQL Server.
2. Copia `backend/.env.example` a `backend/.env` y ajusta tus credenciales (SQL, AWS, Google OAuth).
3. Instala dependencias del backend: `pip install -r backend/requirements.txt`
4. Levanta el servidor: `cd backend` -> `uvicorn app.main:app --reload`
5. Abre `front/html/index.html` con Live Server.

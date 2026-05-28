# Nexus 🚀

Plataforma web de conocimiento visual con arquitectura en Microsoft SQL Server (`pyodbc`), FastAPI y Vanilla JS.
Diseñada bajo una estética *Hacker / Cyberpunk* (Dark Theme puro con acentos Verde Neón).

## Características
- **Mapeo Visual de Nodos**: Diseño Masonry responsivo organizado por Constelaciones.
- **Identidad Hacker/Matrix**: Interfaz inmersiva con fondos `#000000`, tarjetas *Glassmorphism* verde oscuro, y tipografía de alto contraste.
- **Backend Moderno**: API REST en FastAPI.
- **Persistencia Nativa**: SQL Server interactuando mediante T-SQL y Stored Procedures (Sin ORM).
- **Almacenamiento Cloud**: Integración con AWS S3 e IAM para alojamiento de evidencias multimedia.
- **Decisiones Éticas (Rúbrica)**: Control de moderación (Aprobación/Rechazo de nodos), Roles de Usuario y Trazabilidad (AuditLog).

---

## 🛠️ Tecnologías y Arquitectura

- **Backend:** Python (FastAPI).
- **Base de Datos:** SQL Server (Raw SQL usando `pyodbc`). No se utilizan ORMs para garantizar rendimiento puro y trazabilidad estricta.
- **Almacenamiento en la Nube:** AWS S3 (vía pre-signed URLs para carga segura de archivos).
- **Frontend:** Vanilla JavaScript, HTML5 Semántico, CSS (Variables y Grid).
- **Seguridad:** JSON Web Tokens (JWT), encriptación de contraseñas con bcrypt, y segmentación de permisos basada en Roles (RBAC).

---

## 🛡️ Mecanismos Éticos Implementados (Rúbrica)

Para cumplir con las regulaciones éticas de contenido e impacto al usuario, la aplicación implementa de forma obligatoria los siguientes mecanismos:

1. **Control de Publicación (Moderación Preventiva):** Las publicaciones creadas por los usuarios no se muestran al público de forma inmediata. Se guardan con el estado `PENDING_REVIEW` y requieren la aprobación manual de un Administrador.
2. **Restricciones de Acceso:** El backend valida de forma estricta los roles embebidos en el token JWT. Endpoints sensibles (como aprobar o rechazar publicaciones) están restringidos únicamente a usuarios con privilegios (`RoleId = 1`).
3. **Filtro de Contenido por Comunidad:** Los usuarios están empoderados para auto-regular la plataforma. Se habilitó un endpoint de reportes que guarda la trazabilidad exacta (quién denuncia, qué publicación y por qué motivo) en la tabla `moderation.Reports`.

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
- **Python 3.12+**
- **Microsoft SQL Server** (Local o en la nube)
- **ODBC Driver 17 for SQL Server** instalado en el sistema operativo Windows.
- Una cuenta de **AWS** con un bucket S3 y credenciales de acceso.

---

## 🚀 Guía de Ejecución Paso a Paso

### 1. Preparación de la Base de Datos
1. Abre SQL Server Management Studio (SSMS) o Azure Data Studio.
2. Crea una nueva base de datos para el proyecto.
3. Ejecuta el script SQL principal que incluye la creación de los esquemas (`sec`, `content`, `moderation`, `audit`), las tablas, los Triggers de trazabilidad y los Stored Procedures.

### 2. Configuración y Ejecución del Backend (API)
Abre una terminal y colócate en la carpeta raíz del proyecto descargado.

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea un entorno virtual de Python:
   ```bash
   python -m venv .venv
   ```
3. Activa el entorno virtual:
   - **En Windows:** `.\.venv\Scripts\activate`
   - **En Mac/Linux:** `source .venv/bin/activate`
4. Instala las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```
5. Configura el archivo de entorno. Crea un archivo `.env` en la carpeta `backend` con la siguiente estructura:
   ```env
   # Base de Datos
   DB_SERVER=localhost\SQLEXPRESS
   DB_DATABASE=TuBaseDeDatos
   DB_USER=sa
   DB_PASSWORD=TuPassword
   DB_DRIVER=ODBC Driver 17 for SQL Server

   # AWS S3
   AWS_ACCESS_KEY_ID=tu_access_key
   AWS_SECRET_ACCESS_KEY=tu_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=tu-bucket

   # Seguridad
   SECRET_KEY=tu_clave_super_secreta_jwt
   ```
6. Inicia el servidor de FastAPI:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   > El backend estará corriendo en `http://127.0.0.1:8000`. Puedes ver y probar todos los endpoints accediendo a la documentación interactiva en **`http://127.0.0.1:8000/docs`**.

### 3. Ejecución del Frontend (Aplicación Web)
El frontend no necesita compilación ya que es Vanilla JS.

1. Abre otra terminal y navega a la carpeta del frontend:
   ```bash
   cd front
   ```
2. Si usas **VS Code**, la forma recomendada es hacer clic derecho en el archivo `html/index.html` y seleccionar **"Open with Live Server"**.
3. **Alternativa con Python:** Si no usas Live Server, puedes levantar un servidor web simple ejecutando:
   ```bash
   python -m http.server 5500
   ```
   > Luego, abre tu navegador y visita: `http://127.0.0.1:5500/html/index.html`

---

## 📝 Pruebas Básicas del Sistema
1. **Registro:** Ingresa al frontend y regístrate. El primer usuario registrado recibe automáticamente el rol de Administrador.
2. **Subida de Archivos:** Sube una imagen o video. Verifica en tu base de datos que la fila en `content.Pins` tiene estado `PENDING_REVIEW`.
3. **Moderación:** Ingresa al panel de Swagger (`/docs`) usando tu token y utiliza el endpoint `PATCH /api/pins/{pin_id}/status` con `APPROVED` para que la imagen aparezca en el Feed.

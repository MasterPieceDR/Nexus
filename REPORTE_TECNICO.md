# 📄 REPORTE TÉCNICO Y MEMORIA DEL PROYECTO
**Proyecto Integrador: Aplicación Web de Contenido Multimedia (Estilo Pinterest)**

Este documento recopila de manera exhaustiva todo el trabajo realizado en la aplicación, su arquitectura, las tecnologías utilizadas y los requerimientos funcionales y éticos cubiertos.

---

## 1. Visión General del Proyecto
Se desarrolló una plataforma multimedia interactiva donde los usuarios pueden registrarse, iniciar sesión, subir imágenes/videos, visualizar contenido mediante un feed de "scroll infinito" (estilo Masonry), y buscar imágenes por título, descripción o categorías. 

El proyecto cumple con las normativas ético-tecnológicas planteadas en la rúbrica universitaria, asegurando control de moderación y privacidad de los usuarios.

---

## 2. Tecnologías Empleadas
- **Frontend (Cliente):** HTML5 Semántico, Vanilla CSS (Uso intensivo de CSS Variables y Grid Layout para estilo Pinterest), Vanilla JavaScript (Consumo de API Fetch, Promesas, manipulación manual del DOM). No se utilizaron frameworks pesados como React o Angular.
- **Backend (API REST):** Python 3.12 con **FastAPI**. Proporciona alto rendimiento, tipado estático con Pydantic y documentación automática (Swagger UI).
- **Base de Datos:** Microsoft SQL Server.
- **Acceso a Datos:** Raw SQL nativo mediante la librería `pyodbc`. **Se eliminó completamente cualquier ORM (como SQLAlchemy)** para cumplir con el requisito de utilizar T-SQL puro, Stored Procedures y Triggers en el motor de bases de datos.
- **Infraestructura Cloud:** Amazon Web Services (AWS S3) para almacenamiento de imágenes estáticas e IAM (Identity and Access Management) para credenciales temporales seguras.

---

## 3. Arquitectura de la Base de Datos
La base de datos fue normalizada y dividida en 4 esquemas de seguridad:

1. **Esquema `sec` (Seguridad):**
   - `Users`: Almacena usuarios, contraseñas encriptadas (Bcrypt), y datos personales.
   - `Roles`: Almacena niveles de privilegio (`Admin`, `User`).

2. **Esquema `content` (Contenido y Core):**
   - `MediaAssets`: Guarda la referencia de las URLs de S3 (o locales) de las imágenes y videos subidos.
   - `Pins`: Tabla principal del feed. Un Pin une a un Usuario, un MediaAsset y una Categoría. Controla métricas (Vistas, Likes).
   - `Categories` y `Tags`: Para clasificación e indexación de búsqueda.
   - `Comments`, `Reactions`, `SavedPins`: Interacciones de los usuarios.

3. **Esquema `moderation` (Ética y Seguridad de Contenido):**
   - `Reports`: Almacena denuncias hechas por usuarios sobre el contenido, detallando el motivo.

4. **Esquema `audit` (Trazabilidad):**
   - `AuditLog`: Se llena automáticamente usando *Triggers* (Disparadores de SQL) para llevar registro de acciones críticas (ej. Quién borró un registro, a qué hora).

### Procedimientos Almacenados (Stored Procedures)
Toda la lógica compleja de negocio se delegó a la BD mediante Stored Procedures.
- `usp_GetFeed`: Obtiene los pines paginados, filtrando aquellos que no están aprobados.
- `usp_SearchPins`: Realiza búsquedas `LIKE` combinadas de texto y categorías.

---

## 4. Endpoints del Backend (FastAPI)
El código fue modularizado dentro de `backend/app/rutas/`. Se desarrollaron las siguientes rutas:

- **Autenticación (`/auth`)**:
  - `POST /register`: Registro de usuarios. (Hashea contraseñas).
  - `POST /login`: Valida credenciales y genera el token JWT.
- **Publicaciones / Pines (`/api/pins`)**:
  - `GET /feed`: Retorna contenido consumiendo el SP `usp_GetFeed`.
  - `GET /search`: Retorna resultados de búsqueda consumiendo `usp_SearchPins`.
  - `GET /{pin_id}`: Devuelve detalles de un pin específico mediante un `LEFT JOIN`.
  - `POST /`: Sube la metainformación de un pin y lo asocia al S3. Inserta estado `PENDING_REVIEW`.
  - `PATCH /{pin_id}/status`: Ruta exclusiva de Administradores para aprobar o rechazar un post.
- **Usuarios (`/api/users`)**:
  - `GET /me`: Obtiene los datos del perfil actual leyendo el token JWT.
  - `GET /me/posts`: Consulta el historial de publicaciones creadas por el propio usuario.
- **Moderación (`/api/reports`)**:
  - `POST /`: Registra una denuncia en la tabla `moderation.Reports`.
- **Archivos Multimedia (`/uploads`)**:
  - `POST /presigned-url`: Genera un link firmado por AWS (o emulado en local) temporal para subir archivos pesados sin sobrecargar la API.
  - `PUT /local-upload`: Recibe la imagen física y la guarda estáticamente (usado cuando no se usa S3).

---

## 5. Decisiones Éticas y Técnicas (Cumplimiento de Rúbrica)
Para la asignatura correspondiente, se incorporó lógica restrictiva y ética directamente en el código:

1. **Mecanismo de Moderación Preventiva (Control de Publicación)**:
   Se programó que `POST /api/pins` nunca publique la imagen automáticamente. Se inserta en SQL con el campo `State = 'PENDING_REVIEW'`. Esto protege al usuario final de contenido malicioso no supervisado.

2. **Privilegio Mínimo (Mecanismo de Autorización)**:
   Se creó un control de acceso por Roles (RBAC) en el token JWT. El endpoint `PATCH /api/pins/{id}/status` tiene una regla de negocio donde si el `RoleId` del JWT no es de Administrador, lanza un `HTTP 403 Forbidden`. Evita abuso de poder o hackeo.

3. **Autoregulación Comunitaria (Filtro Comunitario)**:
   Se implementó el endpoint `POST /api/reports` para que la comunidad denuncie contenido. Los datos nunca se borran directamente, se auditan y loguean en tablas de moderación, preservando la responsabilidad del usuario que subió el archivo.

---

## 6. Resumen de Refactorización y Trabajo Realizado
A lo largo de las sesiones de trabajo, se ejecutaron las siguientes tareas críticas:
1. **Migración de ORM a SQL Crudo**: El backend original estaba diseñado con SQLAlchemy. Se invirtió la arquitectura, creando la capa `app.db.connection` con `fetch_all`, `fetch_one` y `execute_query` para que todas las llamadas usen consultas SQL nativas (`SELECT`, `INSERT`, `EXEC`).
2. **Conexión ODBC**: Se configuró y testeó el driver `ODBC Driver 17 for SQL Server` de Microsoft para asegurar total compatibilidad en Windows.
3. **Mapeo de Datos en JS**: El Frontend original consumía datos en notación `snake_case` (ej. `media_url`). Como SQL Server devuelve nombres en `PascalCase` (`MediaUrl`), se reescribieron los scripts `index.js`, `cards.js`, `detalle.js` y `upload.js` para iterar correctamente sobre el JSON.
4. **Implementación de JWT Completa**: Se securizaron las rutas, exigiendo el paso del token a través del header `Authorization: Bearer <token>` en todas las llamadas `fetch()` del frontend.
5. **Configuración de AWS S3**: Se implementó la lógica de generación de URLs pre-firmadas mediante el SDK `boto3`.

> Documento final generado para fines académicos y entrega del **Proyecto Integrador**.

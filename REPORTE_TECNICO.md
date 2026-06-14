# 📄 REPORTE TÉCNICO Y MEMORIA DEL PROYECTO
**Proyecto Integrador: Nexus - Plataforma Visual de Conocimiento**

Este documento recopila de manera exhaustiva todo el trabajo realizado en la aplicación, su arquitectura, las tecnologías utilizadas y los requerimientos funcionales y éticos cubiertos.

---

## 1. Visión General del Proyecto
Se desarrolló **Nexus**, una plataforma web visual para descubrir y conectar ideas, proyectos, referencias y recursos creativos. Los usuarios pueden registrarse, iniciar sesión con su cuenta local o de Google, y subir evidencias visuales (llamadas **Nodos**) organizadas por categorías.

La interfaz de usuario ha sido rediseñada para ofrecer una experiencia estética premium, con una paleta cálida basada en tonos café pastel (`#F2ECE4` de fondo en modo claro) y un modo oscuro sofisticado (`#0B0F0C`). El proyecto cumple rigurosamente con las normativas ético-tecnológicas, asegurando control de moderación y privacidad de los usuarios.

---

## 2. Tecnologías Empleadas
- **Frontend (Cliente):** React 19, compilado con **Vite**. Estilos modulares responsivos a través de Tailwind CSS y animaciones fluidas con Canvas HTML5 (esfera armilar 3D interactiva en Login/Registro y simulación de atractor gravitacional en Landing).
- **Backend (API REST):** Python 3.12/3.14 con **FastAPI**. Proporciona alto rendimiento, tipado estático con Pydantic y documentación automática (Swagger UI en `/docs`).
- **Base de Datos:** Microsoft SQL Server.
- **Acceso a Datos:** Raw SQL nativo mediante la librería `pyodbc`. **Se eliminó cualquier ORM (como SQLAlchemy)** para cumplir con el requisito de utilizar T-SQL puro, Procedimientos Almacenados (Stored Procedures) y Triggers.
- **Infraestructura Cloud (AWS):** S3 para alojamiento estático del frontend y almacenamiento multimedia (imágenes/videos), CloudFront como CDN, e instancia EC2.
- **Infraestructura como Código (IaC):** **Terraform** para aprovisionamiento automatizado y reproducible.
- **Autenticación:** Implementación híbrida de JWT (JSON Web Tokens) y Google OAuth2.

---

## 3. Arquitectura de la Base de Datos
La base de datos fue normalizada y dividida en 4 esquemas de seguridad:

1. **`auth`:** Gestión de identidad (`Users`, `Roles`, `UserRoles`).
2. **`content`:** Datos del sistema principal (`Pins` [Nodos], `MediaAssets`, `PinMedia`, `Categories`).
3. **`interaction`:** Relaciones sociales (`Comments`, `SavedPins` [Biblioteca]).
4. **`moderation`:** Cumplimiento ético (`Reports`).

### Seguridad Avanzada (Scripts de BD)
- `01_schema.sql`: Creación de tablas e integridad referencial (Llaves Primarias y Foráneas).
- `02_triggers.sql`: Triggers de auditoría para automatizar la fecha de actualización (`UpdatedAt`).
- `03_procedures.sql`: Toda la lógica de negocio (Inserción, Moderación, Registro) fue encapsulada en procedimientos almacenados.
- `04_seed.sql`: Inserción de administradores y categorías iniciales.
- `05_permissions.sql`: Implementación del Principio de Menor Privilegio (POLP). Se creó el rol `nexus_api_user` al cual se le denegó lectura/escritura a las tablas, dándole solo permiso de `EXECUTE` en los esquemas, asegurando la API contra ataques de inyección.

---

## 4. Adaptaciones y Despliegue en la Nube
Para garantizar un despliegue sin problemas y libre de costos dentro del **AWS Free Tier** (ó cuentas AWS Academy), se implementaron las siguientes soluciones a nivel de infraestructura y código:

### 1. Cambio a Instancia `t2.micro`
* **Solución:** Se configuró en Terraform la variable `instance_type` por defecto a `t2.micro` (eliminando `t3.small` que violaba las políticas de cuentas restringidas).
* **Swap Memory (Memoria de Intercambio):** Al inicio de `user_data.sh`, se configuraron 2GB de memoria Swap en el sistema de archivos de Ubuntu. Esto permite que el motor de base de datos SQL Server Express en Docker (que exige un mínimo de 2GB de RAM para iniciar) corra de forma óptima en el servidor de 1GB de RAM física sin provocar bloqueos del sistema o errores Out-Of-Memory (OOM).

### 2. Compatibilidad del S3 Website con React (SPA)
* **Solución:** En `storage.tf`, se configuró el `IndexDocument` y el `ErrorDocument` de S3 al archivo `index.html`.
* **Razón:** Soluciona el error de S3 de sufijo de documento no válido y permite que el enrutamiento dinámico en el cliente (React Router) funcione sin lanzar errores 404 al recargar la página directamente en rutas secundarias (ej: `/explorar`).

---

## 5. Requerimientos Cubiertos (Checklist)

### ✅ Lógica Backend + Base de Datos (35%)
- Diseño Relacional Normalizado con scripts T-SQL implementados correctamente.
- Integridad Referencial estricta (Llaves Primarias y Foráneas) con Restricciones (Check, Default).
- Funcionalidades T-SQL Aplicadas (Stored Procedures, Vistas, Triggers).
- Seguridad a Nivel de Base de Datos (Manejo de accesos vía procedimientos almacenados).
- Eliminación de ORM e integración de capa transaccional manual (`pyodbc`).

### ✅ API e Integración con Cloud (30%)
- Endpoint CRUD Completo para los Nodos Visuales, usuarios y autenticación.
- Integración segura con API de S3 (AWS) mediante el patrón de URLs Pre-firmadas.
- Documentación automatizada del API (FastAPI Swagger accesible en `/docs`).

### ✅ Lógica Frontend y Visual (20%)
- Mosaico dinámico (Masonry Grid) reactivo en React que carga Nodos mediante llamadas a la API.
- Paleta café/verde suave y profesional (con modo oscuro nativo).
- Interfaz Multimedia. Visualizador para imágenes y reproducción nativa de videos (MP4) integrada.
- Barra lateral interactiva colapsable.

### ✅ Ética de la Información (15%)
Se integró de manera demostrable a nivel de código y diseño de base de datos la ética tecnológica:
- **Términos Claros:** El formulario de registro informa a los usuarios sus responsabilidades.
- **Auditoría de Subida:** Al subir un Nodo, el usuario debe declarar explícitamente si se generó con Inteligencia Artificial o si contiene material Sensible.
- **Moderación Activa:** Todos los pines nuevos tienen estado `PENDING` por defecto. No se muestran en el "Explorar" público hasta que un moderador los apruebe explícitamente desde el panel de moderación.
- **Reportes:** Cualquier usuario puede reportar un nodo que infrinja normas, lo cual abre un ticket que solo administradores o moderadores pueden resolver (incluso pueden "Eliminar Contenido" desde el backend).

---

## 6. Casos de Uso Clave
1. **El Navegante (Visitante):** Puede ver Nodos aprobados de todos los usuarios de forma anónima desde el Feed público.
2. **El Creador (Usuario):** Puede registrarse, iniciar sesión con su correo o con Google, subir imágenes o videos. Si son sensibles o con IA, las marca. Puede ver sus Nodos en revisión o aprobados en su Perfil.
3. **El Evaluador (Moderador/Admin):** Puede usar su panel de administración para ver todos los Nodos con estado `PENDING_REVIEW` y aprobarlos (haciéndolos públicos) o rechazarlos (ocultándolos de la base de datos).

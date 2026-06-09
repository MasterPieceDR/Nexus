# 📄 REPORTE TÉCNICO Y MEMORIA DEL PROYECTO
**Proyecto Integrador: Nexus - Plataforma Visual de Conocimiento**

Este documento recopila de manera exhaustiva todo el trabajo realizado en la aplicación, su arquitectura, las tecnologías utilizadas y los requerimientos funcionales y éticos cubiertos.

---

## 1. Visión General del Proyecto
Se desarrolló **Nexus**, una plataforma web visual para descubrir y conectar ideas, proyectos, referencias y recursos creativos. Los usuarios pueden registrarse, iniciar sesión con su correo o cuenta de Google, y subir evidencias visuales (llamadas **Nodos**) organizadas por categorías o en futuras **Constelaciones**. 

A diferencia de un simple "clon de Pinterest", Nexus adopta una interfaz minimalista, inspirada en plataformas modernas de curación visual (como Cosmos). Su paleta de colores (`#F8FAF8`, verde `#16A34A`, negro `#0B0F0C`) refleja una red de conocimiento profesional orientada a la ciencia, el diseño y la tecnología. El proyecto cumple rigurosamente con las normativas ético-tecnológicas planteadas en la rúbrica universitaria, asegurando control de moderación y privacidad.

---

## 2. Tecnologías Empleadas
- **Frontend (Cliente):** HTML5 Semántico, Vanilla CSS (Sistema modular de estilos: base, layout, components) y Vanilla JavaScript (Consumo de API Fetch, Componentes de UI modulares).
- **Backend (API REST):** Python 3.12 con **FastAPI**. Proporciona alto rendimiento, tipado estático con Pydantic y documentación automática (Swagger UI).
- **Base de Datos:** Microsoft SQL Server.
- **Acceso a Datos:** Raw SQL nativo mediante la librería `pyodbc`. **Se eliminó completamente cualquier ORM (como SQLAlchemy)** para cumplir con el requisito de utilizar T-SQL puro, Procedimientos Almacenados (Stored Procedures) y Triggers.
- **Infraestructura Cloud:** Amazon Web Services (AWS S3) para almacenamiento de imágenes estáticas y videos, generadas mediante Pre-signed URLs para evitar sobrecarga en el servidor.
- **Autenticación:** Implementación híbrida de JWT propio y OAuth2 de Google.

---

## 3. Arquitectura de la Base de Datos
La base de datos fue normalizada y dividida en 4 esquemas de seguridad:

1. **`auth`:** Gestión de identidad (`Users`, `Roles`, `UserRoles`).
2. **`content`:** Datos del sistema principal (`Pins` [Nodos], `MediaAssets`, `PinMedia`, `Categories` [Áreas]).
3. **`interaction`:** Relaciones sociales (`Comments` [Conexiones], `SavedPins` [Biblioteca]).
4. **`moderation`:** Cumplimiento ético (`Reports`).

### Seguridad Avanzada (Scripts de BD)
- `01_schema.sql`: Creación de tablas.
- `02_triggers.sql`: Triggers de auditoría para `UpdatedAt`.
- `03_procedures.sql`: Toda la lógica de negocio (Inserción, Moderación, Registro) fue encapsulada en procedimientos.
- `04_seed.sql`: Inserción de administradores y categorías iniciales.
- `05_permissions.sql`: Implementación del Principio de Menor Privilegio (POLP). Se creó el rol `nexus_api_user` al cual se le denegó lectura/escritura a las tablas, dándole solo permiso de `EXECUTE` en los esquemas, asegurando la API contra ataques de inyección.

---

## 4. Requerimientos Cubiertos (Checklist)

### ✅ Lógica Backend + Base de Datos (35%)
- Diseño Relacional Normalizado con scripts T-SQL implementados correctamente.
- Integridad Referencial estricta (Llaves Primarias y Foráneas) con Restricciones (Check, Default).
- Funcionalidades T-SQL Aplicadas (Stored Procedures, Vistas, Triggers).
- Seguridad a Nivel de Base de Datos (Manejo de accesos vía procedimientos almacenados).
- Eliminación de ORM e integración de capa transaccional manual (`pyodbc`).

### ✅ API e Integración con IA (30%)
- Endpoint CRUD Completo para los Nodos Visuales, usuarios y autenticación.
- Integración segura con API de S3 (AWS) mediante el patrón de URLs Pre-firmadas.
- Documentación automatizada del API (FastAPI Swagger accesible en `/docs`).

### ✅ Lógica Frontend y Visual (20%)
- Mosaico dinámico (Masonry Grid CSS puro) que carga Nodos mediante Javascript y maneja el estado de carga y vistas vacías.
- Rediseño general con paleta verde/claro profesional (Estilo Cosmos).
- Interfaz Multimedia. Visualizador para Imágenes y Videos integrados.
- Menú dinámico de navegación basado en roles.

### ✅ Ética de la Información (15%)
Se integró de manera demostrable a nivel de código y diseño de base de datos la ética tecnológica:
- **Términos Claros:** El formulario de registro informa a los usuarios sus responsabilidades.
- **Auditoría de Subida:** Al subir un Nodo, el usuario debe declarar explícitamente si se generó con Inteligencia Artificial o si el contenido es Sensible.
- **Moderación Activa:** Todos los pines nuevos tienen estado `PENDING` por defecto. No se muestran en el "Explorar" público hasta que un moderador (desde la vista `moderacion.html`) los aprueba explícitamente.
- **Reportes:** Cualquier usuario puede reportar un nodo que infrinja normas, lo cual abre un ticket que solo administradores o moderadores pueden resolver (incluso pueden "Eliminar Contenido" desde el backend).

---

## 5. Casos de Uso Clave
1. **El Navegante:** Puede ver Nodos aprobados de todos los usuarios en el `index.html`.
2. **El Creador:** Puede subir imágenes o videos. Si son sensibles, las marca. Una vez subido el nodo, es invisible hasta que un moderador lo apruebe. En `usuario.html` puede ver sus Nodos en revisión o aprobados.
3. **El Evaluador (Moderador):** Puede usar su panel en `moderacion.html` para ver todos los Nodos con estado `PENDING_REVIEW`, y aprobarlos (haciéndolos públicos) o rechazarlos (ocultándolos definitivamente).

## Conclusión
Nexus cumple y supera los requerimientos del proyecto integrador, fusionando arquitectura en la nube (S3), seguridad en Base de Datos (T-SQL Scripts y Roles), diseño responsivo avanzado (CSS Masonry) y prácticas de protección ética digital.

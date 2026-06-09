USE NexusDB;
GO
INSERT INTO core.Categories (Name, Slug, Description, SortOrder)
SELECT Name, Slug, Description, SortOrder
FROM (VALUES
    (N'Innovación', N'innovacion', N'Ideas, creatividad, laboratorios y proyectos innovadores', 1),
    (N'Cloud Computing', N'cloud-computing', N'Infraestructura cloud, servidores, arquitectura y servicios en la nube', 2),
    (N'Bases de Datos', N'bases-de-datos', N'SQL Server, datos, analítica, modelado y almacenamiento', 3),
    (N'Ciberseguridad', N'ciberseguridad', N'Seguridad digital, privacidad, accesos y protección de sistemas', 4),
    (N'Inteligencia Artificial', N'inteligencia-artificial', N'IA, automatización, redes neuronales y análisis inteligente', 5),
    (N'Diseño UI/UX', N'diseno-ui-ux', N'Interfaces, experiencia de usuario, prototipos y diseño visual', 6),
    (N'Programación Web', N'programacion-web', N'HTML, CSS, JavaScript, frontend, backend y desarrollo web', 7),
    (N'DevOps', N'devops', N'Automatización, despliegue, infraestructura como código y operación', 8),
    (N'Redes', N'redes', N'Conectividad, servidores, redes informáticas e infraestructura', 9),
    (N'Prototipos', N'prototipos', N'Prototipado, validación de ideas, diseño de producto y experimentación', 10),
    (N'Robótica e IoT', N'robotica-iot', N'Robótica, sensores, dispositivos conectados e internet de las cosas', 11),
    (N'Sostenibilidad Tecnológica', N'sostenibilidad-tech', N'Tecnología verde, eficiencia, sostenibilidad e innovación responsable', 12)
) C(Name, Slug, Description, SortOrder)
WHERE NOT EXISTS (
    SELECT 1
    FROM core.Categories X
    WHERE X.Slug = C.Slug
);
GO
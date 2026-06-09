USE NexusDB;
GO
DECLARE @OwnerUserId BIGINT;
SELECT TOP 1 @OwnerUserId = UserId
FROM sec.Users
WHERE DeletedAt IS NULL
ORDER BY UserId;
IF @OwnerUserId IS NULL
BEGIN
    DECLARE @NewUserId BIGINT;
    EXEC sec.usp_RegisterUser
        @Email = N'demo@nexus.local',
        @Username = N'nexus_demo',
        @PasswordHash = N'DEMO_HASH_NO_LOGIN',
        @DisplayName = N'Nexus Demo',
        @RoleName = N'CREATOR',
        @ActorUserId = NULL,
        @NewUserId = @NewUserId OUTPUT;
    SET @OwnerUserId = @NewUserId;
END;
GO
DECLARE @OwnerUserId BIGINT;
SELECT TOP 1 @OwnerUserId = UserId
FROM sec.Users
WHERE DeletedAt IS NULL
ORDER BY UserId;
DECLARE @Constellations TABLE (
    Name NVARCHAR(120),
    Slug NVARCHAR(140),
    Description NVARCHAR(500),
    CategorySlug NVARCHAR(120),
    Visibility NVARCHAR(20)
);
INSERT INTO @Constellations (Name, Slug, Description, CategorySlug, Visibility)
VALUES
(N'Galaxia Cloud', N'galaxia-cloud', N'Constelación dedicada a infraestructura en la nube, AWS, S3, EC2, IAM y Terraform.', N'cloud-computing', N'PUBLIC'),
(N'Órbita SQL Server', N'orbita-sql-server', N'Colección de nodos sobre bases de datos, consultas, procedimientos almacenados y modelado.', N'bases-de-datos', N'PUBLIC'),
(N'Núcleo de Ciberseguridad', N'nucleo-ciberseguridad', N'Recursos visuales sobre protección de datos, accesos, privacidad y seguridad informática.', N'ciberseguridad', N'PUBLIC'),
(N'Red de Inteligencia Artificial', N'red-inteligencia-artificial', N'Ideas, referencias y nodos relacionados con IA, automatización y análisis inteligente.', N'inteligencia-artificial', N'PUBLIC'),
(N'Constelación UI/UX', N'constelacion-ui-ux', N'Diseños visuales, interfaces, prototipos y experiencias de usuario.', N'diseno-ui-ux', N'PUBLIC'),
(N'Universo Web', N'universo-web', N'Nodos sobre HTML, CSS, JavaScript, FastAPI y desarrollo web moderno.', N'programacion-web', N'PUBLIC'),
(N'Ruta DevOps', N'ruta-devops', N'Automatización, despliegue, infraestructura como código y operación de servicios.', N'devops', N'PUBLIC'),
(N'Malla de Redes', N'malla-redes', N'Recursos sobre redes, conectividad, servidores e infraestructura digital.', N'redes', N'PUBLIC'),
(N'Laboratorio de Prototipos', N'laboratorio-prototipos', N'Ideas visuales para prototipado, validación, diseño de producto e innovación.', N'prototipos', N'PUBLIC'),
(N'Ecosistema Tech Verde', N'ecosistema-tech-verde', N'Tecnología sostenible, innovación responsable, eficiencia y soluciones verdes.', N'sostenibilidad-tech', N'PUBLIC');
INSERT INTO content.Boards (
    OwnerUserId,
    Name,
    Slug,
    Description,
    Visibility,
    CreatedAt
)
SELECT
    @OwnerUserId,
    C.Name,
    C.Slug,
    C.Description,
    C.Visibility,
    SYSDATETIME()
FROM @Constellations C
WHERE NOT EXISTS (
    SELECT 1
    FROM content.Boards B
    WHERE B.OwnerUserId = @OwnerUserId
    AND B.Slug = C.Slug
    AND B.DeletedAt IS NULL
);
GO
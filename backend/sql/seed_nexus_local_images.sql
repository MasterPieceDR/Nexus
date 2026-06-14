USE NexusDB;
GO

DECLARE @OwnerUserId BIGINT = 1;
DECLARE @CategoryId INT;
DECLARE @MediaId BIGINT;
DECLARE @PinId BIGINT;

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'innovacion';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/innovacion/innovacion-001.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/innovacion/innovacion-001.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'innovacion-001.webp',
        @SizeBytes = 30828,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Innovación #1',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'innovacion, creatividad, tecnologia, ideas, nexus',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'innovacion';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/innovacion/innovacion-002.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/innovacion/innovacion-002.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'innovacion-002.webp',
        @SizeBytes = 23324,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Innovación #2',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'innovacion, creatividad, tecnologia, ideas, nexus',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'innovacion';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/innovacion/innovacion-003.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/innovacion/innovacion-003.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'innovacion-003.webp',
        @SizeBytes = 58264,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Innovación #3',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'innovacion, creatividad, tecnologia, ideas, nexus',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'innovacion';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/innovacion/innovacion-004.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/innovacion/innovacion-004.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'innovacion-004.webp',
        @SizeBytes = 25454,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Innovación #4',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'innovacion, creatividad, tecnologia, ideas, nexus',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'innovacion';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/innovacion/innovacion-005.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/innovacion/innovacion-005.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'innovacion-005.webp',
        @SizeBytes = 29018,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Innovación #5',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'innovacion, creatividad, tecnologia, ideas, nexus',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'cloud-computing';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/cloud-computing/cloud-computing-006.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/cloud-computing/cloud-computing-006.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'cloud-computing-006.webp',
        @SizeBytes = 28082,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Cloud Computing #6',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'cloud, aws, infraestructura, servidores, terraform',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'cloud-computing';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/cloud-computing/cloud-computing-007.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/cloud-computing/cloud-computing-007.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'cloud-computing-007.webp',
        @SizeBytes = 38996,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Cloud Computing #7',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'cloud, aws, infraestructura, servidores, terraform',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'cloud-computing';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/cloud-computing/cloud-computing-008.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/cloud-computing/cloud-computing-008.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'cloud-computing-008.webp',
        @SizeBytes = 90370,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Cloud Computing #8',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/cloud-computing-8/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'cloud, aws, infraestructura, servidores, terraform',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'cloud-computing';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/cloud-computing/cloud-computing-009.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/cloud-computing/cloud-computing-009.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'cloud-computing-009.webp',
        @SizeBytes = 67526,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Cloud Computing #9',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'cloud, aws, infraestructura, servidores, terraform',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'cloud-computing';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/cloud-computing/cloud-computing-010.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/cloud-computing/cloud-computing-010.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'cloud-computing-010.webp',
        @SizeBytes = 35632,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Cloud Computing #10',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'cloud, aws, infraestructura, servidores, terraform',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'bases-de-datos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/bases-de-datos/bases-de-datos-011.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/bases-de-datos/bases-de-datos-011.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'bases-de-datos-011.webp',
        @SizeBytes = 30486,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Bases de Datos #11',
        @Description = N'Recurso útil para probar el feed visual, la búsqueda y el filtrado por categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sqlserver, database, datos, consultas, backend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'bases-de-datos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/bases-de-datos/bases-de-datos-012.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/bases-de-datos/bases-de-datos-012.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'bases-de-datos-012.webp',
        @SizeBytes = 27768,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Bases de Datos #12',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sqlserver, database, datos, consultas, backend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'bases-de-datos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/bases-de-datos/bases-de-datos-013.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/bases-de-datos/bases-de-datos-013.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'bases-de-datos-013.webp',
        @SizeBytes = 19858,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Bases de Datos #13',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sqlserver, database, datos, consultas, backend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'bases-de-datos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/bases-de-datos/bases-de-datos-014.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/bases-de-datos/bases-de-datos-014.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'bases-de-datos-014.webp',
        @SizeBytes = 39156,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Idea destacada de Bases de Datos #14',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sqlserver, database, datos, consultas, backend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'bases-de-datos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/bases-de-datos/bases-de-datos-015.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/bases-de-datos/bases-de-datos-015.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'bases-de-datos-015.webp',
        @SizeBytes = 55222,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Bases de Datos #15',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sqlserver, database, datos, consultas, backend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'ciberseguridad';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/ciberseguridad/ciberseguridad-016.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/ciberseguridad/ciberseguridad-016.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'ciberseguridad-016.webp',
        @SizeBytes = 80110,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Ciberseguridad #16',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'seguridad, privacidad, iam, accesos, proteccion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'ciberseguridad';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/ciberseguridad/ciberseguridad-017.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/ciberseguridad/ciberseguridad-017.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'ciberseguridad-017.webp',
        @SizeBytes = 29376,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Ciberseguridad #17',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'seguridad, privacidad, iam, accesos, proteccion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'ciberseguridad';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/ciberseguridad/ciberseguridad-018.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/ciberseguridad/ciberseguridad-018.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'ciberseguridad-018.webp',
        @SizeBytes = 55222,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Ciberseguridad para explorar nuevas ideas #18',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'seguridad, privacidad, iam, accesos, proteccion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'ciberseguridad';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/ciberseguridad/ciberseguridad-019.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/ciberseguridad/ciberseguridad-019.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'ciberseguridad-019.webp',
        @SizeBytes = 45148,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Ciberseguridad #19',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'seguridad, privacidad, iam, accesos, proteccion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'ciberseguridad';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/ciberseguridad/ciberseguridad-020.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/ciberseguridad/ciberseguridad-020.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'ciberseguridad-020.webp',
        @SizeBytes = 52050,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Ciberseguridad #20',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://picsum.photos/seed/ciberseguridad-20/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'seguridad, privacidad, iam, accesos, proteccion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'inteligencia-artificial';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/inteligencia-artificial/inteligencia-artificial-021.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/inteligencia-artificial/inteligencia-artificial-021.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'inteligencia-artificial-021.webp',
        @SizeBytes = 103752,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Inteligencia Artificial #21',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/inteligencia-artificial-21/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ia, machine-learning, automatizacion, datos, neural',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'inteligencia-artificial';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/inteligencia-artificial/inteligencia-artificial-022.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/inteligencia-artificial/inteligencia-artificial-022.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'inteligencia-artificial-022.webp',
        @SizeBytes = 8906,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Inteligencia Artificial #22',
        @Description = N'Recurso útil para probar el feed visual, la búsqueda y el filtrado por categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ia, machine-learning, automatizacion, datos, neural',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'inteligencia-artificial';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/inteligencia-artificial/inteligencia-artificial-023.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/inteligencia-artificial/inteligencia-artificial-023.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'inteligencia-artificial-023.webp',
        @SizeBytes = 34392,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Inteligencia Artificial #23',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ia, machine-learning, automatizacion, datos, neural',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'inteligencia-artificial';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/inteligencia-artificial/inteligencia-artificial-024.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/inteligencia-artificial/inteligencia-artificial-024.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'inteligencia-artificial-024.webp',
        @SizeBytes = 16778,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Inteligencia Artificial #24',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ia, machine-learning, automatizacion, datos, neural',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'inteligencia-artificial';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/inteligencia-artificial/inteligencia-artificial-025.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/inteligencia-artificial/inteligencia-artificial-025.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'inteligencia-artificial-025.webp',
        @SizeBytes = 180494,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Inteligencia Artificial #25',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ia, machine-learning, automatizacion, datos, neural',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'diseno-ui-ux';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/diseno-ui-ux/diseno-ui-ux-026.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/diseno-ui-ux/diseno-ui-ux-026.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'diseno-ui-ux-026.webp',
        @SizeBytes = 21598,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Idea destacada de Diseño UI/UX #26',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ui, ux, diseno, interfaz, prototipo',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'diseno-ui-ux';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/diseno-ui-ux/diseno-ui-ux-027.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/diseno-ui-ux/diseno-ui-ux-027.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'diseno-ui-ux-027.webp',
        @SizeBytes = 28422,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Idea destacada de Diseño UI/UX #27',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ui, ux, diseno, interfaz, prototipo',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'diseno-ui-ux';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/diseno-ui-ux/diseno-ui-ux-028.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/diseno-ui-ux/diseno-ui-ux-028.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'diseno-ui-ux-028.webp',
        @SizeBytes = 34276,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Diseño UI/UX #28',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/diseno-ui-ux-28/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ui, ux, diseno, interfaz, prototipo',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'diseno-ui-ux';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/diseno-ui-ux/diseno-ui-ux-029.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/diseno-ui-ux/diseno-ui-ux-029.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'diseno-ui-ux-029.webp',
        @SizeBytes = 23028,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Diseño UI/UX #29',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ui, ux, diseno, interfaz, prototipo',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'diseno-ui-ux';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/diseno-ui-ux/diseno-ui-ux-030.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/diseno-ui-ux/diseno-ui-ux-030.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'diseno-ui-ux-030.webp',
        @SizeBytes = 83384,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Diseño UI/UX #30',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'ui, ux, diseno, interfaz, prototipo',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'programacion-web';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/programacion-web/programacion-web-031.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/programacion-web/programacion-web-031.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'programacion-web-031.webp',
        @SizeBytes = 25818,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Programación Web #31',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'html, css, javascript, fastapi, frontend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'programacion-web';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/programacion-web/programacion-web-032.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/programacion-web/programacion-web-032.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'programacion-web-032.webp',
        @SizeBytes = 35092,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Programación Web #32',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'html, css, javascript, fastapi, frontend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'programacion-web';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/programacion-web/programacion-web-033.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/programacion-web/programacion-web-033.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'programacion-web-033.webp',
        @SizeBytes = 37822,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Programación Web #33',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'html, css, javascript, fastapi, frontend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'programacion-web';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/programacion-web/programacion-web-034.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/programacion-web/programacion-web-034.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'programacion-web-034.webp',
        @SizeBytes = 25610,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Programación Web #34',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'html, css, javascript, fastapi, frontend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'programacion-web';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/programacion-web/programacion-web-035.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/programacion-web/programacion-web-035.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'programacion-web-035.webp',
        @SizeBytes = 39156,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Programación Web #35',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'html, css, javascript, fastapi, frontend',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'devops';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/devops/devops-036.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/devops/devops-036.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'devops-036.webp',
        @SizeBytes = 17804,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de DevOps #36',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'devops, terraform, despliegue, automatizacion, ec2',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'devops';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/devops/devops-037.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/devops/devops-037.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'devops-037.webp',
        @SizeBytes = 60274,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre DevOps #37',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/devops-37/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'devops, terraform, despliegue, automatizacion, ec2',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'devops';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/devops/devops-038.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/devops/devops-038.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'devops-038.webp',
        @SizeBytes = 67842,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de DevOps #38',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://picsum.photos/seed/devops-38/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'devops, terraform, despliegue, automatizacion, ec2',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'devops';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/devops/devops-039.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/devops/devops-039.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'devops-039.webp',
        @SizeBytes = 67526,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de DevOps #39',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'devops, terraform, despliegue, automatizacion, ec2',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'devops';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/devops/devops-040.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/devops/devops-040.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'devops-040.webp',
        @SizeBytes = 7886,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de DevOps #40',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'devops, terraform, despliegue, automatizacion, ec2',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'redes';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/redes/redes-041.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/redes/redes-041.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'redes-041.webp',
        @SizeBytes = 28082,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Redes para explorar nuevas ideas #41',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'redes, conectividad, servidores, infraestructura, red',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'redes';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/redes/redes-042.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/redes/redes-042.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'redes-042.webp',
        @SizeBytes = 67526,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Redes #42',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'redes, conectividad, servidores, infraestructura, red',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'redes';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/redes/redes-043.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/redes/redes-043.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'redes-043.webp',
        @SizeBytes = 100892,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Redes #43',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/redes-43/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'redes, conectividad, servidores, infraestructura, red',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'redes';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/redes/redes-044.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/redes/redes-044.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'redes-044.webp',
        @SizeBytes = 55222,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Redes #44',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'redes, conectividad, servidores, infraestructura, red',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'redes';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/redes/redes-045.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/redes/redes-045.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'redes-045.webp',
        @SizeBytes = 23288,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Redes #45',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'redes, conectividad, servidores, infraestructura, red',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'prototipos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/prototipos/prototipos-046.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/prototipos/prototipos-046.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'prototipos-046.webp',
        @SizeBytes = 21598,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Prototipos #46',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'prototipo, producto, creatividad, validacion, idea',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'prototipos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/prototipos/prototipos-047.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/prototipos/prototipos-047.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'prototipos-047.webp',
        @SizeBytes = 23028,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Prototipos para explorar nuevas ideas #47',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'prototipo, producto, creatividad, validacion, idea',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'prototipos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/prototipos/prototipos-048.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/prototipos/prototipos-048.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'prototipos-048.webp',
        @SizeBytes = 28422,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Prototipos #48',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'prototipo, producto, creatividad, validacion, idea',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'prototipos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/prototipos/prototipos-049.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/prototipos/prototipos-049.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'prototipos-049.webp',
        @SizeBytes = 21140,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Prototipos para explorar nuevas ideas #49',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://picsum.photos/seed/prototipos-49/800/1200',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'prototipo, producto, creatividad, validacion, idea',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'prototipos';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/prototipos/prototipos-050.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/prototipos/prototipos-050.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'prototipos-050.webp',
        @SizeBytes = 83384,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Prototipos #50',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'prototipo, producto, creatividad, validacion, idea',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'robotica-iot';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/robotica-iot/robotica-iot-051.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/robotica-iot/robotica-iot-051.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'robotica-iot-051.webp',
        @SizeBytes = 19374,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Robótica e IoT #51',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'robotica, iot, sensores, dispositivos, automatizacion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'robotica-iot';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/robotica-iot/robotica-iot-052.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/robotica-iot/robotica-iot-052.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'robotica-iot-052.webp',
        @SizeBytes = 21810,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Robótica e IoT #52',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'robotica, iot, sensores, dispositivos, automatizacion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'robotica-iot';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/robotica-iot/robotica-iot-053.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/robotica-iot/robotica-iot-053.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'robotica-iot-053.webp',
        @SizeBytes = 52874,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Robótica e IoT #53',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'robotica, iot, sensores, dispositivos, automatizacion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'robotica-iot';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/robotica-iot/robotica-iot-054.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/robotica-iot/robotica-iot-054.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'robotica-iot-054.webp',
        @SizeBytes = 40746,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Robótica e IoT #54',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'robotica, iot, sensores, dispositivos, automatizacion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'robotica-iot';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/robotica-iot/robotica-iot-055.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/robotica-iot/robotica-iot-055.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'robotica-iot-055.webp',
        @SizeBytes = 37110,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Idea destacada de Robótica e IoT #55',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'robotica, iot, sensores, dispositivos, automatizacion',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'sostenibilidad-tech';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/sostenibilidad-tech/sostenibilidad-tech-056.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/sostenibilidad-tech/sostenibilidad-tech-056.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'sostenibilidad-tech-056.webp',
        @SizeBytes = 52868,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Sostenibilidad Tecnológica #56',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sostenibilidad, tecnologia-verde, innovacion, energia, impacto',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'sostenibilidad-tech';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/sostenibilidad-tech/sostenibilidad-tech-057.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/sostenibilidad-tech/sostenibilidad-tech-057.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'sostenibilidad-tech-057.webp',
        @SizeBytes = 42556,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Sostenibilidad Tecnológica #57',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sostenibilidad, tecnologia-verde, innovacion, energia, impacto',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'sostenibilidad-tech';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/sostenibilidad-tech/sostenibilidad-tech-058.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/sostenibilidad-tech/sostenibilidad-tech-058.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'sostenibilidad-tech-058.webp',
        @SizeBytes = 19446,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Sostenibilidad Tecnológica #58',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sostenibilidad, tecnologia-verde, innovacion, energia, impacto',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'sostenibilidad-tech';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/sostenibilidad-tech/sostenibilidad-tech-059.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/sostenibilidad-tech/sostenibilidad-tech-059.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'sostenibilidad-tech-059.webp',
        @SizeBytes = 41322,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Sostenibilidad Tecnológica #59',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sostenibilidad, tecnologia-verde, innovacion, energia, impacto',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

SELECT @CategoryId = CategoryId FROM core.Categories WHERE Slug = N'sostenibilidad-tech';
IF @CategoryId IS NOT NULL
BEGIN
    SET @MediaId = NULL;
    EXEC content.usp_CreateMediaAsset
        @OwnerUserId = @OwnerUserId,
        @BucketName = N'local-dev',
        @ObjectKey = N'seed/images/sostenibilidad-tech/sostenibilidad-tech-060.webp',
        @MediaUrl = N'http://localhost:8000/static/seed/images/sostenibilidad-tech/sostenibilidad-tech-060.webp',
        @MediaKind = N'IMAGE',
        @MimeType = N'image/webp',
        @OriginalFileName = N'sostenibilidad-tech-060.webp',
        @SizeBytes = 35632,
        @NewMediaId = @MediaId OUTPUT;

    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Sostenibilidad Tecnológica #60',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://unsplash.com',
        @Visibility = N'PUBLIC',
        @IsAiGenerated = 0,
        @IsSensitive = 0,
        @MediaId = @MediaId,
        @TagsCsv = N'sostenibilidad, tecnologia-verde, innovacion, energia, impacto',
        @NewPinId = @PinId OUTPUT;

    EXEC content.usp_UpdatePinStatus
        @PinId = @PinId,
        @Status = N'APPROVED',
        @ActorUserId = @OwnerUserId;
END

GO
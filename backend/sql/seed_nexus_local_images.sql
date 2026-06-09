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
        @SizeBytes = 90360,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Innovación #1',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/innovacion-1/800/1200',
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
        @SizeBytes = 44942,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Innovación #2',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/innovacion-2/800/1200',
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
        @SizeBytes = 103752,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Innovación #3',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/innovacion-3/800/1200',
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
        @SizeBytes = 62744,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Innovación #4',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://picsum.photos/seed/innovacion-4/800/1200',
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
        @SizeBytes = 105810,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Innovación para explorar nuevas ideas #5',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://picsum.photos/seed/innovacion-5/800/1200',
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
        @SizeBytes = 90370,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Cloud Computing para explorar nuevas ideas #6',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://picsum.photos/seed/cloud-computing-6/800/1200',
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
        @SizeBytes = 44544,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Cloud Computing #7',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/cloud-computing-7/800/1200',
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
        @Title = N'Referencia visual sobre Cloud Computing #8',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
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
        @SizeBytes = 37912,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Cloud Computing #9',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://picsum.photos/seed/cloud-computing-9/800/1200',
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
        @SizeBytes = 148008,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Cloud Computing #10',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/cloud-computing-10/800/1200',
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
        @SizeBytes = 151576,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Bases de Datos para explorar nuevas ideas #11',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://picsum.photos/seed/bases-de-datos-11/800/1200',
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
        @SizeBytes = 8770,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Bases de Datos para explorar nuevas ideas #12',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/bases-de-datos-12/800/1200',
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
        @SizeBytes = 157872,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Bases de Datos #13',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://picsum.photos/seed/bases-de-datos-13/800/1200',
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
        @SizeBytes = 159572,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Bases de Datos #14',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://picsum.photos/seed/bases-de-datos-14/800/1200',
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
        @SizeBytes = 36314,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Bases de Datos #15',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/bases-de-datos-15/800/1200',
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
        @SizeBytes = 39490,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Ciberseguridad para explorar nuevas ideas #16',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://picsum.photos/seed/ciberseguridad-16/800/1200',
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
        @SizeBytes = 137160,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Ciberseguridad #17',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/ciberseguridad-17/800/1200',
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
        @SizeBytes = 195468,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Ciberseguridad #18',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/ciberseguridad-18/800/1200',
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
        @SizeBytes = 41928,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Ciberseguridad #19',
        @Description = N'Recurso útil para probar el feed visual, la búsqueda y el filtrado por categorías.',
        @SourceUrl = N'https://picsum.photos/seed/ciberseguridad-19/800/1200',
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
        @Title = N'Recurso para constelaciones de Ciberseguridad #20',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
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
        @Title = N'Inspiración aplicada a Inteligencia Artificial #21',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
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
        @SizeBytes = 102346,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Inteligencia Artificial para explorar nuevas ideas #22',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://picsum.photos/seed/inteligencia-artificial-22/800/1200',
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
        @SizeBytes = 21138,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Inteligencia Artificial para explorar nuevas ideas #23',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://picsum.photos/seed/inteligencia-artificial-23/800/1200',
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
        @SizeBytes = 87782,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Inteligencia Artificial #24',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/inteligencia-artificial-24/800/1200',
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
        @SizeBytes = 55028,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Inteligencia Artificial #25',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/inteligencia-artificial-25/800/1200',
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
        @SizeBytes = 44544,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Diseño UI/UX #26',
        @Description = N'Recurso útil para probar el feed visual, la búsqueda y el filtrado por categorías.',
        @SourceUrl = N'https://picsum.photos/seed/diseno-ui-ux-26/800/1200',
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
        @SizeBytes = 56676,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Diseño UI/UX #27',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/diseno-ui-ux-27/800/1200',
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
        @Title = N'Idea destacada de Diseño UI/UX #28',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
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
        @SizeBytes = 98338,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Diseño UI/UX para explorar nuevas ideas #29',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://picsum.photos/seed/diseno-ui-ux-29/800/1200',
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
        @SizeBytes = 85082,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de Diseño UI/UX para explorar nuevas ideas #30',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://picsum.photos/seed/diseno-ui-ux-30/800/1200',
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
        @SizeBytes = 122090,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Programación Web #31',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/programacion-web-31/800/1200',
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
        @SizeBytes = 111918,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Programación Web #32',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://picsum.photos/seed/programacion-web-32/800/1200',
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
        @SizeBytes = 62016,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Programación Web #33',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/programacion-web-33/800/1200',
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
        @SizeBytes = 83428,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Programación Web #34',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://picsum.photos/seed/programacion-web-34/800/1200',
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
        @SizeBytes = 77630,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Programación Web #35',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/programacion-web-35/800/1200',
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
        @SizeBytes = 41936,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de DevOps #36',
        @Description = N'Este contenido puede funcionar como ejemplo de publicación multimedia dentro del sistema.',
        @SourceUrl = N'https://picsum.photos/seed/devops-36/800/1200',
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
        @Title = N'Evidencia visual relacionada con DevOps #37',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
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
        @Title = N'Concepto moderno sobre DevOps #38',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
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
        @SizeBytes = 106276,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Idea destacada de DevOps #39',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://picsum.photos/seed/devops-39/800/1200',
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
        @SizeBytes = 269910,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Nodo de DevOps para explorar nuevas ideas #40',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/devops-40/800/1200',
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
        @SizeBytes = 107638,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Redes #41',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/redes-41/800/1200',
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
        @SizeBytes = 141122,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Redes #42',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/redes-42/800/1200',
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
        @Title = N'Referencia visual sobre Redes #43',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
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
        @SizeBytes = 83976,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Redes #44',
        @Description = N'Referencia visual adecuada para demostrar organización de recursos por etiquetas y categorías.',
        @SourceUrl = N'https://picsum.photos/seed/redes-44/800/1200',
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
        @SizeBytes = 113202,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Redes #45',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/redes-45/800/1200',
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
        @SizeBytes = 235180,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Conexión creativa para proyectos de Prototipos #46',
        @Description = N'Recurso útil para probar el feed visual, la búsqueda y el filtrado por categorías.',
        @SourceUrl = N'https://picsum.photos/seed/prototipos-46/800/1200',
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
        @SizeBytes = 56364,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Prototipos #47',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://picsum.photos/seed/prototipos-47/800/1200',
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
        @SizeBytes = 173378,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Prototipos #48',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://picsum.photos/seed/prototipos-48/800/1200',
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
        @Title = N'Conexión creativa para proyectos de Prototipos #49',
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
        @SizeBytes = 122616,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Prototipos #50',
        @Description = N'Nodo útil para validar la vista de detalle, comentarios y guardados.',
        @SourceUrl = N'https://picsum.photos/seed/prototipos-50/800/1200',
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
        @SizeBytes = 158154,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Robótica e IoT #51',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/robotica-iot-51/800/1200',
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
        @SizeBytes = 62112,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso para constelaciones de Robótica e IoT #52',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/robotica-iot-52/800/1200',
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
        @SizeBytes = 14466,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Mapa visual de Robótica e IoT #53',
        @Description = N'Este recurso ayuda a representar visualmente proyectos, evidencias o inspiración tecnológica.',
        @SourceUrl = N'https://picsum.photos/seed/robotica-iot-53/800/1200',
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
        @SizeBytes = 32356,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Robótica e IoT #54',
        @Description = N'Contenido inicial para alimentar la plataforma y probar la API localmente.',
        @SourceUrl = N'https://picsum.photos/seed/robotica-iot-54/800/1200',
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
        @SizeBytes = 144824,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Recurso visual de Robótica e IoT #55',
        @Description = N'Este nodo puede servir como referencia inicial para conectar ideas dentro de Nexus.',
        @SourceUrl = N'https://picsum.photos/seed/robotica-iot-55/800/1200',
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
        @SizeBytes = 17944,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Evidencia visual relacionada con Sostenibilidad Tecnológica #56',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/sostenibilidad-tech-56/800/1200',
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
        @SizeBytes = 16420,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Sostenibilidad Tecnológica #57',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://picsum.photos/seed/sostenibilidad-tech-57/800/1200',
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
        @SizeBytes = 201268,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Referencia visual sobre Sostenibilidad Tecnológica #58',
        @Description = N'Imagen recomendada para representar conceptos técnicos y creativos dentro de una constelación.',
        @SourceUrl = N'https://picsum.photos/seed/sostenibilidad-tech-58/800/1200',
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
        @SizeBytes = 49970,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Inspiración aplicada a Sostenibilidad Tecnológica #59',
        @Description = N'Imagen de prueba para demostrar carga dinámica desde SQL Server y FastAPI.',
        @SourceUrl = N'https://picsum.photos/seed/sostenibilidad-tech-59/800/1200',
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
        @SizeBytes = 59222,
        @NewMediaId = @MediaId OUTPUT;
    SET @PinId = NULL;
    EXEC content.usp_CreatePin
        @OwnerUserId = @OwnerUserId,
        @BoardId = NULL,
        @CategoryId = @CategoryId,
        @Title = N'Concepto moderno sobre Sostenibilidad Tecnológica #60',
        @Description = N'Nodo visual preparado para probar el flujo de Nexus en ambiente local.',
        @SourceUrl = N'https://picsum.photos/seed/sostenibilidad-tech-60/800/1200',
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
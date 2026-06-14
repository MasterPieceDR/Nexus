-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS V3 UPGRADE — Migración incremental (idempotente, no destruye datos)
-- Cubre: perfil/empresa, verificación de información, valoraciones de la app,
-- validaciones IA/OCR, interacciones para feed personalizado e índices.
-- Ejecutar después de 01..06. Seguro de re-ejecutar.
-- ═══════════════════════════════════════════════════════════════════════════
USE NexusDB;
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PERFIL: campos profesionales / empresa + teléfono de usuario
-- ─────────────────────────────────────────────────────────────────────────────
IF COL_LENGTH('sec.UserProfiles', 'IsCompany') IS NULL
    ALTER TABLE sec.UserProfiles ADD IsCompany BIT NOT NULL DEFAULT 0;
IF COL_LENGTH('sec.UserProfiles', 'CompanyName') IS NULL
    ALTER TABLE sec.UserProfiles ADD CompanyName NVARCHAR(150) NULL;
IF COL_LENGTH('sec.UserProfiles', 'Mission') IS NULL
    ALTER TABLE sec.UserProfiles ADD Mission NVARCHAR(500) NULL;
IF COL_LENGTH('sec.UserProfiles', 'Vision') IS NULL
    ALTER TABLE sec.UserProfiles ADD Vision NVARCHAR(500) NULL;
IF COL_LENGTH('sec.UserProfiles', 'ProfessionalArea') IS NULL
    ALTER TABLE sec.UserProfiles ADD ProfessionalArea NVARCHAR(150) NULL;
IF COL_LENGTH('sec.UserProfiles', 'CompanyDescription') IS NULL
    ALTER TABLE sec.UserProfiles ADD CompanyDescription NVARCHAR(1000) NULL;
IF COL_LENGTH('sec.UserProfiles', 'ContactEmail') IS NULL
    ALTER TABLE sec.UserProfiles ADD ContactEmail NVARCHAR(255) NULL;
IF COL_LENGTH('sec.UserProfiles', 'ContactPhone') IS NULL
    ALTER TABLE sec.UserProfiles ADD ContactPhone NVARCHAR(50) NULL;
IF COL_LENGTH('sec.Users', 'PhoneNumber') IS NULL
    ALTER TABLE sec.Users ADD PhoneNumber NVARCHAR(30) NULL;
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VERIFICACIÓN DE INFORMACIÓN en Pins
--    Estados: UNVERIFIED | PENDING_VERIFICATION | VERIFIED | REJECTED
-- ─────────────────────────────────────────────────────────────────────────────
IF COL_LENGTH('content.Pins', 'AuthorClaim') IS NULL
    ALTER TABLE content.Pins ADD AuthorClaim NVARCHAR(255) NULL;
IF COL_LENGTH('content.Pins', 'VerifiedStatus') IS NULL
    ALTER TABLE content.Pins ADD VerifiedStatus NVARCHAR(30) NOT NULL DEFAULT N'UNVERIFIED';
IF COL_LENGTH('content.Pins', 'VerifiedBy') IS NULL
    ALTER TABLE content.Pins ADD VerifiedBy BIGINT NULL REFERENCES sec.Users(UserId);
IF COL_LENGTH('content.Pins', 'VerifiedAt') IS NULL
    ALTER TABLE content.Pins ADD VerifiedAt DATETIME2 NULL;
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. VALIDACIONES IA / OCR (resultados de moderación automática)
-- ─────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('moderation.AiValidations', 'U') IS NULL
BEGIN
    CREATE TABLE moderation.AiValidations (
        ValidationId BIGINT IDENTITY(1,1) PRIMARY KEY,
        PinId BIGINT NULL REFERENCES content.Pins(PinId),
        MediaId BIGINT NULL,
        Provider NVARCHAR(60) NOT NULL,            -- MOCK | GOOGLE_VISION | AWS_REKOGNITION | HF_NSFW | CLOUDINARY
        Score DECIMAL(5,4) NULL,                   -- 0.0000 - 1.0000 (probabilidad de contenido no seguro)
        Labels NVARCHAR(MAX) NULL,                 -- JSON con etiquetas detectadas
        OcrText NVARCHAR(MAX) NULL,                -- texto extraído de la imagen
        IsExplicit BIT NOT NULL DEFAULT 0,
        IsIllegal BIT NOT NULL DEFAULT 0,
        IsSafeForMinors BIT NOT NULL DEFAULT 1,
        Status NVARCHAR(30) NOT NULL,              -- APPROVED | PENDING | BLOCKED
        Reason NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VALORACIONES DE LA APLICACIÓN (estrellas + comentario)
-- ─────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('core.AppRatings', 'U') IS NULL
BEGIN
    CREATE TABLE core.AppRatings (
        RatingId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL REFERENCES sec.Users(UserId),
        Rating TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
        Comment NVARCHAR(1000) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INTERACCIONES para feed personalizado
-- ─────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('social.PinViews', 'U') IS NULL
BEGIN
    CREATE TABLE social.PinViews (
        ViewId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL REFERENCES sec.Users(UserId),
        PinId BIGINT NOT NULL REFERENCES content.Pins(PinId),
        ViewedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID('social.SearchLog', 'U') IS NULL
BEGIN
    CREATE TABLE social.SearchLog (
        SearchId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NULL REFERENCES sec.Users(UserId),
        Query NVARCHAR(200) NOT NULL,
        CategoryId INT NULL,
        ResultsCount INT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID('social.UserInterests', 'U') IS NULL
BEGIN
    CREATE TABLE social.UserInterests (
        UserId BIGINT NOT NULL REFERENCES sec.Users(UserId),
        CategoryId INT NOT NULL REFERENCES core.Categories(CategoryId),
        Score DECIMAL(10,2) NOT NULL DEFAULT 0,    -- acumulado por likes/saves/views/searches
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        PRIMARY KEY (UserId, CategoryId)
    );
END
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ÍNDICES de optimización (solo si no existen)
-- ─────────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Pins_Status_PublishedAt')
    CREATE INDEX IX_Pins_Status_PublishedAt ON content.Pins (Status, Visibility, PublishedAt DESC) INCLUDE (CategoryId, OwnerUserId) WHERE DeletedAt IS NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Pins_Owner')
    CREATE INDEX IX_Pins_Owner ON content.Pins (OwnerUserId, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Pins_Category')
    CREATE INDEX IX_Pins_Category ON content.Pins (CategoryId) WHERE DeletedAt IS NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Pins_VerifiedStatus')
    CREATE INDEX IX_Pins_VerifiedStatus ON content.Pins (VerifiedStatus);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Comments_Pin')
    CREATE INDEX IX_Comments_Pin ON content.Comments (PinId, CreatedAt DESC) WHERE DeletedAt IS NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PinReactions_User')
    CREATE INDEX IX_PinReactions_User ON content.PinReactions (UserId, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PinSaves_User')
    CREATE INDEX IX_PinSaves_User ON content.PinSaves (UserId, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reports_Status')
    CREATE INDEX IX_Reports_Status ON moderation.Reports (Status, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MediaAssets_Owner')
    CREATE INDEX IX_MediaAssets_Owner ON content.MediaAssets (OwnerUserId) WHERE DeletedAt IS NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PinViews_User')
    CREATE INDEX IX_PinViews_User ON social.PinViews (UserId, ViewedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PinViews_Pin')
    CREATE INDEX IX_PinViews_Pin ON social.PinViews (PinId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SearchLog_User')
    CREATE INDEX IX_SearchLog_User ON social.SearchLog (UserId, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AppRatings_Created')
    CREATE INDEX IX_AppRatings_Created ON core.AppRatings (CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AiValidations_Pin')
    CREATE INDEX IX_AiValidations_Pin ON moderation.AiValidations (PinId, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Tags_Slug')
    CREATE INDEX IX_Tags_Slug ON core.Tags (Slug);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. usp_GetFeed: incluir VerifiedStatus y SourceUrl (compatible hacia atrás)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE content.usp_GetFeed
    @ViewerUserId BIGINT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    IF @PageNumber < 1 SET @PageNumber = 1;
    IF @PageSize < 1 SET @PageSize = 30;
    IF @PageSize > 100 SET @PageSize = 100;

    SELECT
        P.PinId, P.Title, P.Description, P.Status, P.Visibility,
        P.SavesCount, P.CommentsCount, P.ReactionsCount, P.ViewsCount,
        P.CreatedAt, P.PublishedAt,
        P.SourceUrl, P.VerifiedStatus,
        U.UserId AS OwnerUserId, U.Username, U.DisplayName,
        C.CategoryId, C.Name AS CategoryName,
        M.MediaId, M.MediaUrl, M.MediaKind, M.WidthPx, M.HeightPx,
        CASE WHEN PS.UserId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS IsSavedByViewer
    FROM content.Pins P
    INNER JOIN sec.Users U ON U.UserId = P.OwnerUserId
    LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId
    OUTER APPLY (
        SELECT TOP 1 MA.MediaId, MA.MediaUrl, MA.MediaKind, MA.WidthPx, MA.HeightPx
        FROM content.PinMedia PM
        INNER JOIN content.MediaAssets MA ON MA.MediaId = PM.MediaId
        WHERE PM.PinId = P.PinId
        ORDER BY PM.SortOrder ASC
    ) M
    LEFT JOIN content.PinSaves PS ON PS.PinId = P.PinId AND PS.UserId = @ViewerUserId
    WHERE P.Status = N'APPROVED'
    AND P.Visibility = N'PUBLIC'
    AND P.DeletedAt IS NULL
    ORDER BY P.PublishedAt DESC, P.CreatedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. usp_SearchPinsV2: filtros avanzados (autor, verificados, orden) + DTO completo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE content.usp_SearchPinsV2
    @Search NVARCHAR(200) = NULL,
    @CategoryId INT = NULL,
    @TagSlug NVARCHAR(100) = NULL,
    @AuthorUsername NVARCHAR(100) = NULL,
    @VerifiedOnly BIT = 0,
    @SortBy NVARCHAR(20) = N'recent',      -- recent | popular
    @ViewerUserId BIGINT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    IF @PageNumber < 1 SET @PageNumber = 1;
    IF @PageSize < 1 SET @PageSize = 30;
    IF @PageSize > 100 SET @PageSize = 100;

    SELECT
        P.PinId, P.Title, P.Description,
        P.SavesCount, P.CommentsCount, P.ReactionsCount, P.ViewsCount,
        P.CreatedAt, P.PublishedAt,
        P.SourceUrl, P.VerifiedStatus,
        U.UserId AS OwnerUserId, U.Username, U.DisplayName,
        C.CategoryId, C.Name AS CategoryName,
        M.MediaUrl, M.MediaKind,
        CASE WHEN PS.UserId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS IsSavedByViewer
    FROM content.Pins P
    INNER JOIN sec.Users U ON U.UserId = P.OwnerUserId
    LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId
    OUTER APPLY (
        SELECT TOP 1 MA.MediaUrl, MA.MediaKind
        FROM content.PinMedia PM
        INNER JOIN content.MediaAssets MA ON MA.MediaId = PM.MediaId
        WHERE PM.PinId = P.PinId
        ORDER BY PM.SortOrder ASC
    ) M
    LEFT JOIN content.PinSaves PS ON PS.PinId = P.PinId AND PS.UserId = @ViewerUserId
    WHERE P.Status = N'APPROVED'
    AND P.Visibility = N'PUBLIC'
    AND P.DeletedAt IS NULL
    AND (@CategoryId IS NULL OR P.CategoryId = @CategoryId)
    AND (@TagSlug IS NULL OR EXISTS (
        SELECT 1 FROM content.PinTags PT
        INNER JOIN core.Tags T ON T.TagId = PT.TagId
        WHERE PT.PinId = P.PinId AND T.Slug = @TagSlug
    ))
    AND (@AuthorUsername IS NULL OR U.Username = @AuthorUsername)
    AND (@VerifiedOnly = 0 OR P.VerifiedStatus = N'VERIFIED')
    AND (
        @Search IS NULL
        OR P.Title LIKE N'%' + @Search + N'%'
        OR P.Description LIKE N'%' + @Search + N'%'
        OR EXISTS (
            SELECT 1 FROM content.PinTags PT2
            INNER JOIN core.Tags T2 ON T2.TagId = PT2.TagId
            WHERE PT2.PinId = P.PinId AND T2.Name LIKE N'%' + @Search + N'%'
        )
    )
    ORDER BY
        CASE WHEN @SortBy = N'popular' THEN (P.ReactionsCount * 3 + P.SavesCount * 4 + P.CommentsCount * 2 + P.ViewsCount) END DESC,
        P.PublishedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. usp_GetPersonalizedFeed: feed según intereses del usuario
--    (likes x3, saves x4, vistas x1, búsquedas x2 — acumulados por categoría)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE content.usp_GetPersonalizedFeed
    @ViewerUserId BIGINT,
    @PageNumber INT = 1,
    @PageSize INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    IF @PageNumber < 1 SET @PageNumber = 1;
    IF @PageSize < 1 SET @PageSize = 30;
    IF @PageSize > 100 SET @PageSize = 100;

    -- Señales de interés por categoría (calculadas al vuelo, baratas con los índices)
    ;WITH Signals AS (
        SELECT P.CategoryId, COUNT(*) * 3.0 AS S
        FROM content.PinReactions R
        JOIN content.Pins P ON P.PinId = R.PinId
        WHERE R.UserId = @ViewerUserId AND P.CategoryId IS NOT NULL
        GROUP BY P.CategoryId
        UNION ALL
        SELECT P.CategoryId, COUNT(*) * 4.0
        FROM content.PinSaves S
        JOIN content.Pins P ON P.PinId = S.PinId
        WHERE S.UserId = @ViewerUserId AND P.CategoryId IS NOT NULL
        GROUP BY P.CategoryId
        UNION ALL
        SELECT P.CategoryId, COUNT(*) * 1.0
        FROM social.PinViews V
        JOIN content.Pins P ON P.PinId = V.PinId
        WHERE V.UserId = @ViewerUserId AND P.CategoryId IS NOT NULL
        GROUP BY P.CategoryId
        UNION ALL
        SELECT SL.CategoryId, COUNT(*) * 2.0
        FROM social.SearchLog SL
        WHERE SL.UserId = @ViewerUserId AND SL.CategoryId IS NOT NULL
        GROUP BY SL.CategoryId
    ),
    Interest AS (
        SELECT CategoryId, SUM(S) AS Score
        FROM Signals
        GROUP BY CategoryId
    )
    SELECT
        P.PinId, P.Title, P.Description, P.Status, P.Visibility,
        P.SavesCount, P.CommentsCount, P.ReactionsCount, P.ViewsCount,
        P.CreatedAt, P.PublishedAt,
        P.SourceUrl, P.VerifiedStatus,
        U.UserId AS OwnerUserId, U.Username, U.DisplayName,
        C.CategoryId, C.Name AS CategoryName,
        M.MediaId, M.MediaUrl, M.MediaKind, M.WidthPx, M.HeightPx,
        CASE WHEN PS.UserId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS IsSavedByViewer,
        ISNULL(I.Score, 0) AS InterestScore
    FROM content.Pins P
    INNER JOIN sec.Users U ON U.UserId = P.OwnerUserId
    LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId
    LEFT JOIN Interest I ON I.CategoryId = P.CategoryId
    OUTER APPLY (
        SELECT TOP 1 MA.MediaId, MA.MediaUrl, MA.MediaKind, MA.WidthPx, MA.HeightPx
        FROM content.PinMedia PM
        INNER JOIN content.MediaAssets MA ON MA.MediaId = PM.MediaId
        WHERE PM.PinId = P.PinId
        ORDER BY PM.SortOrder ASC
    ) M
    LEFT JOIN content.PinSaves PS ON PS.PinId = P.PinId AND PS.UserId = @ViewerUserId
    WHERE P.Status = N'APPROVED'
    AND P.Visibility = N'PUBLIC'
    AND P.DeletedAt IS NULL
    ORDER BY ISNULL(I.Score, 0) DESC, P.PublishedAt DESC, P.CreatedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. usp_VerifyPin: validación manual de información (solo admin/moderador)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE content.usp_VerifyPin
    @PinId BIGINT,
    @VerifiedStatus NVARCHAR(30),     -- UNVERIFIED | PENDING_VERIFICATION | VERIFIED | REJECTED
    @ActorUserId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE content.Pins
    SET VerifiedStatus = @VerifiedStatus,
        VerifiedBy = CASE WHEN @VerifiedStatus IN (N'VERIFIED', N'REJECTED') THEN @ActorUserId ELSE NULL END,
        VerifiedAt = CASE WHEN @VerifiedStatus IN (N'VERIFIED', N'REJECTED') THEN SYSDATETIME() ELSE NULL END,
        UpdatedAt = SYSDATETIME()
    WHERE PinId = @PinId AND DeletedAt IS NULL;

    EXEC audit.usp_WriteAuditLog
        @ActorUserId = @ActorUserId,
        @ActionName = N'PIN_VERIFY',
        @EntityName = N'content.Pins',
        @EntityId = @PinId,
        @NewData = @VerifiedStatus;
END
GO

PRINT 'Migración 07_nexus_v3_upgrade aplicada correctamente.';
GO

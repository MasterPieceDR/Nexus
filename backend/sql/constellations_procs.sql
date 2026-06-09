USE NexusDB;
GO
CREATE OR ALTER PROCEDURE content.usp_CreateConstellation
    @OwnerUserId BIGINT,
    @Name NVARCHAR(120),
    @Description NVARCHAR(500) = NULL,
    @Visibility NVARCHAR(20) = N'PUBLIC',
    @NewBoardId BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @BaseSlug NVARCHAR(140);
    DECLARE @FinalSlug NVARCHAR(140);
    DECLARE @Counter INT = 0;
    SET @BaseSlug = LOWER(@Name);
    SET @BaseSlug = REPLACE(@BaseSlug, N'á', N'a');
    SET @BaseSlug = REPLACE(@BaseSlug, N'é', N'e');
    SET @BaseSlug = REPLACE(@BaseSlug, N'í', N'i');
    SET @BaseSlug = REPLACE(@BaseSlug, N'ó', N'o');
    SET @BaseSlug = REPLACE(@BaseSlug, N'ú', N'u');
    SET @BaseSlug = REPLACE(@BaseSlug, N'ñ', N'n');
    SET @BaseSlug = REPLACE(@BaseSlug, N' ', N'-');
    SET @BaseSlug = REPLACE(@BaseSlug, N'_', N'-');
    SET @FinalSlug = @BaseSlug;
    WHILE EXISTS (
        SELECT 1
        FROM content.Boards
        WHERE OwnerUserId = @OwnerUserId
        AND Slug = @FinalSlug
        AND DeletedAt IS NULL
    )
    BEGIN
        SET @Counter = @Counter + 1;
        SET @FinalSlug = @BaseSlug + N'-' + CAST(@Counter AS NVARCHAR(10));
    END;
    INSERT INTO content.Boards (
        OwnerUserId,
        Name,
        Slug,
        Description,
        Visibility
    )
    VALUES (
        @OwnerUserId,
        @Name,
        @FinalSlug,
        @Description,
        @Visibility
    );
    SET @NewBoardId = SCOPE_IDENTITY();
    EXEC audit.usp_WriteAuditLog
        @ActorUserId = @OwnerUserId,
        @ActionName = N'CONSTELLATION_CREATE',
        @EntityName = N'content.Boards',
        @EntityId = @NewBoardId,
        @NewData = @Name;
END
GO
CREATE OR ALTER PROCEDURE content.usp_GetPublicConstellations
    @Search NVARCHAR(160) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        B.BoardId,
        B.Name,
        B.Slug,
        B.Description,
        B.Visibility,
        B.CreatedAt,
        U.UserId AS OwnerUserId,
        U.Username,
        U.DisplayName,
        ISNULL(Nodes.TotalNodes, 0) AS TotalNodes,
        Cover.MediaUrl AS CoverUrl
    FROM content.Boards B
    INNER JOIN sec.Users U ON U.UserId = B.OwnerUserId
    OUTER APPLY (
        SELECT COUNT(1) AS TotalNodes
        FROM content.Pins P
        WHERE P.BoardId = B.BoardId
        AND P.Status = N'APPROVED'
        AND P.DeletedAt IS NULL
    ) Nodes
    OUTER APPLY (
        SELECT TOP 1 MA.MediaUrl
        FROM content.Pins P
        INNER JOIN content.PinMedia PM ON PM.PinId = P.PinId
        INNER JOIN content.MediaAssets MA ON MA.MediaId = PM.MediaId
        WHERE P.BoardId = B.BoardId
        AND P.Status = N'APPROVED'
        AND P.DeletedAt IS NULL
        ORDER BY P.PublishedAt DESC, P.CreatedAt DESC
    ) Cover
    WHERE B.Visibility = N'PUBLIC'
    AND B.DeletedAt IS NULL
    AND (
        @Search IS NULL
        OR B.Name LIKE N'%' + @Search + N'%'
        OR B.Description LIKE N'%' + @Search + N'%'
    )
    ORDER BY B.CreatedAt DESC;
END
GO
CREATE OR ALTER PROCEDURE content.usp_GetMyConstellations
    @OwnerUserId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        B.BoardId,
        B.Name,
        B.Slug,
        B.Description,
        B.Visibility,
        B.CreatedAt,
        ISNULL(Nodes.TotalNodes, 0) AS TotalNodes,
        Cover.MediaUrl AS CoverUrl
    FROM content.Boards B
    OUTER APPLY (
        SELECT COUNT(1) AS TotalNodes
        FROM content.Pins P
        WHERE P.BoardId = B.BoardId
        AND P.DeletedAt IS NULL
    ) Nodes
    OUTER APPLY (
        SELECT TOP 1 MA.MediaUrl
        FROM content.Pins P
        INNER JOIN content.PinMedia PM ON PM.PinId = P.PinId
        INNER JOIN content.MediaAssets MA ON MA.MediaId = PM.MediaId
        WHERE P.BoardId = B.BoardId
        AND P.DeletedAt IS NULL
        ORDER BY P.CreatedAt DESC
    ) Cover
    WHERE B.OwnerUserId = @OwnerUserId
    AND B.DeletedAt IS NULL
    ORDER BY B.CreatedAt DESC;
END
GO
CREATE OR ALTER PROCEDURE content.usp_AddPinToConstellation
    @OwnerUserId BIGINT,
    @BoardId BIGINT,
    @PinId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (
        SELECT 1
        FROM content.Boards
        WHERE BoardId = @BoardId
        AND OwnerUserId = @OwnerUserId
        AND DeletedAt IS NULL
    )
    BEGIN
        THROW 52001, 'La constelación no existe o no pertenece al usuario.', 1;
    END;
    IF NOT EXISTS (
        SELECT 1
        FROM content.Pins
        WHERE PinId = @PinId
        AND OwnerUserId = @OwnerUserId
        AND DeletedAt IS NULL
    )
    BEGIN
        THROW 52002, 'El nodo no existe o no pertenece al usuario.', 1;
    END;
    UPDATE content.Pins
    SET BoardId = @BoardId,
        UpdatedAt = SYSDATETIME()
    WHERE PinId = @PinId
    AND OwnerUserId = @OwnerUserId;
    EXEC audit.usp_WriteAuditLog
        @ActorUserId = @OwnerUserId,
        @ActionName = N'PIN_ADD_TO_CONSTELLATION',
        @EntityName = N'content.Pins',
        @EntityId = @PinId,
        @NewData = @BoardId;
END
GO
USE NexusDB;
GO
CREATE OR ALTER PROCEDURE sec.usp_RegisterUser
    @DisplayName NVARCHAR(100),
    @Email NVARCHAR(255),
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @RoleId INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO sec.Users (DisplayName, Email, Username, PasswordHash, RoleId)
    VALUES (@DisplayName, @Email, @Username, @PasswordHash, @RoleId);
    SELECT 
        u.UserId, u.DisplayName, u.Email, u.Username, u.RoleId, r.RoleName
    FROM sec.Users u
    JOIN sec.Roles r ON u.RoleId = r.RoleId
    WHERE u.UserId = SCOPE_IDENTITY();
END
GO
CREATE OR ALTER PROCEDURE sec.usp_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.UserId, u.DisplayName, u.Email, u.Username, u.PasswordHash, u.RoleId, r.RoleName
    FROM sec.Users u
    JOIN sec.Roles r ON u.RoleId = r.RoleId
    WHERE u.Email = @Email AND u.IsActive = 1;
END
GO
CREATE OR ALTER PROCEDURE sec.usp_LoginWithGoogle
    @ProviderKey NVARCHAR(255),
    @Email NVARCHAR(255),
    @DisplayName NVARCHAR(100),
    @AvatarUrl NVARCHAR(1000) = NULL,
    @UserId INT OUTPUT,
    @OutDisplayName NVARCHAR(100) OUTPUT,
    @OutEmail NVARCHAR(255) OUTPUT,
    @OutUsername NVARCHAR(50) OUTPUT,
    @OutRoleId INT OUTPUT,
    @OutRoleName NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ProviderId INT;
    IF NOT EXISTS (SELECT 1 FROM sec.AuthProviders WHERE ProviderName = 'Google')
    BEGIN
        INSERT INTO sec.AuthProviders (ProviderName) VALUES ('Google');
    END
    SELECT @ProviderId = ProviderId FROM sec.AuthProviders WHERE ProviderName = 'Google';
    SELECT @UserId = UserId FROM sec.UserExternalLogins WHERE ProviderId = @ProviderId AND ProviderKey = @ProviderKey;
    IF @UserId IS NULL
    BEGIN
        SELECT @UserId = UserId FROM sec.Users WHERE Email = @Email;
        IF @UserId IS NULL
        BEGIN
            DECLARE @BaseUsername NVARCHAR(50) = REPLACE(@Email, '@', '_');
            SET @BaseUsername = REPLACE(@BaseUsername, '.', '_');
            INSERT INTO sec.Users (DisplayName, Email, Username, RoleId)
            VALUES (@DisplayName, @Email, @BaseUsername, 5);
            SET @UserId = SCOPE_IDENTITY();
        END
        INSERT INTO sec.UserExternalLogins (UserId, ProviderId, ProviderKey)
        VALUES (@UserId, @ProviderId, @ProviderKey);
    END
    SELECT 
        @OutDisplayName = u.DisplayName,
        @OutEmail = u.Email,
        @OutUsername = u.Username,
        @OutRoleId = u.RoleId,
        @OutRoleName = r.RoleName
    FROM sec.Users u
    JOIN sec.Roles r ON u.RoleId = r.RoleId
    WHERE u.UserId = @UserId;
END
GO
CREATE OR ALTER PROCEDURE content.usp_CreateMediaAsset
    @OwnerUserId INT,
    @MediaUrl NVARCHAR(1000),
    @MediaKind NVARCHAR(50),
    @MimeType NVARCHAR(100),
    @SizeBytes BIGINT,
    @MediaAssetId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO content.MediaAssets (UserId, MediaUrl, MediaKind, MimeType, SizeBytes)
    VALUES (@OwnerUserId, @MediaUrl, @MediaKind, @MimeType, @SizeBytes);
    SET @MediaAssetId = SCOPE_IDENTITY();
END
GO
CREATE OR ALTER PROCEDURE content.usp_CreatePin
    @OwnerUserId INT,
    @CategoryId INT,
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @IsAiGenerated BIT,
    @IsSensitive BIT,
    @PinId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO content.Pins (OwnerUserId, CategoryId, Title, Description, IsAiGenerated, IsSensitive, Status)
    VALUES (@OwnerUserId, @CategoryId, @Title, @Description, @IsAiGenerated, @IsSensitive, 'PENDING');
    SET @PinId = SCOPE_IDENTITY();
    INSERT INTO audit.AuditLog (UserId, Action, Entity, EntityId, Details)
    VALUES (@OwnerUserId, 'CREATE', 'PIN', @PinId, 'Pin created and pending review');
END
GO
CREATE OR ALTER PROCEDURE content.usp_GetPinDetail
    @PinId INT,
    @ViewerUserId INT = NULL,
    @IpAddress NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE content.Pins SET ViewsCount = ViewsCount + 1 WHERE PinId = @PinId;
    SELECT 
        p.PinId, p.Title, p.Description, p.SavesCount, p.CommentsCount, 
        p.ReactionsCount, p.ViewsCount, p.PublishedAt, p.Status,
        m.MediaUrl, m.MediaKind, u.DisplayName AS AuthorName
    FROM content.Pins p
    LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
    LEFT JOIN content.MediaAssets m ON pm.MediaAssetId = m.MediaAssetId
    LEFT JOIN sec.Users u ON p.OwnerUserId = u.UserId
    WHERE p.PinId = @PinId;
END
GO
CREATE OR ALTER PROCEDURE content.usp_GetFeed
    @ViewerUserId INT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.PinId, p.Title, p.Description, c.Name AS CategoryName,
        u.DisplayName, m.MediaUrl, m.MediaKind,
        p.PublishedAt
    FROM content.Pins p
    JOIN core.Categories c ON p.CategoryId = c.CategoryId
    JOIN sec.Users u ON p.OwnerUserId = u.UserId
    LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
    LEFT JOIN content.MediaAssets m ON pm.MediaAssetId = m.MediaAssetId
    WHERE p.Status = 'APPROVED'
    ORDER BY p.PublishedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
CREATE OR ALTER PROCEDURE content.usp_SearchPins
    @Search NVARCHAR(255) = NULL,
    @CategoryId INT = NULL,
    @TagSlug NVARCHAR(100) = NULL,
    @ViewerUserId INT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.PinId, p.Title, p.Description, c.Name AS CategoryName,
        u.DisplayName, m.MediaUrl, m.MediaKind,
        p.PublishedAt
    FROM content.Pins p
    JOIN core.Categories c ON p.CategoryId = c.CategoryId
    JOIN sec.Users u ON p.OwnerUserId = u.UserId
    LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
    LEFT JOIN content.MediaAssets m ON pm.MediaAssetId = m.MediaAssetId
    WHERE p.Status = 'APPROVED'
      AND (@Search IS NULL OR p.Title LIKE '%' + @Search + '%' OR p.Description LIKE '%' + @Search + '%')
      AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
    ORDER BY p.PublishedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
CREATE OR ALTER PROCEDURE content.usp_UpdatePinStatus
    @PinId INT,
    @Status NVARCHAR(50),
    @ModeratorUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE content.Pins
    SET Status = @Status,
        PublishedAt = CASE WHEN @Status = 'APPROVED' THEN GETDATE() ELSE PublishedAt END
    WHERE PinId = @PinId;
    INSERT INTO audit.AuditLog (UserId, Action, Entity, EntityId, Details)
    VALUES (@ModeratorUserId, 'UPDATE_STATUS', 'PIN', @PinId, 'Status changed to ' + @Status);
END
GO
CREATE OR ALTER PROCEDURE moderation.usp_ReportEntity
    @ReporterUserId INT,
    @EntityType NVARCHAR(50),
    @EntityId INT,
    @Reason NVARCHAR(500),
    @Details NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO moderation.Reports (ReporterUserId, EntityType, EntityId, Reason, Details)
    VALUES (@ReporterUserId, @EntityType, @EntityId, @Reason, @Details);
    INSERT INTO audit.AuditLog (UserId, Action, Entity, EntityId, Details)
    VALUES (@ReporterUserId, 'REPORT', @EntityType, @EntityId, 'Entity reported: ' + @Reason);
END
GO
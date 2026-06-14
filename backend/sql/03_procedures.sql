USE NexusDB;
GO

CREATE OR ALTER PROCEDURE sec.usp_RegisterUser

    @Email NVARCHAR(180),

    @Username NVARCHAR(80),

    @PasswordHash NVARCHAR(255),

    @DisplayName NVARCHAR(120),

    @RoleName NVARCHAR(50) = N'USER',

    @ActorUserId BIGINT = NULL,

    @NewUserId BIGINT OUTPUT

AS

BEGIN

    SET NOCOUNT ON;

    SET XACT_ABORT ON;

    DECLARE @RoleId INT;

    SELECT @RoleId = RoleId

    FROM sec.Roles

    WHERE RoleName = @RoleName

    AND IsActive = 1;

    IF @RoleId IS NULL

    BEGIN

        THROW 50001, 'El rol indicado no existe o no está activo.', 1;

    END;

    IF EXISTS (SELECT 1 FROM sec.Users WHERE Email = LOWER(@Email))

    BEGIN

        THROW 50002, 'El correo ya está registrado.', 1;

    END;

    IF EXISTS (SELECT 1 FROM sec.Users WHERE Username = LOWER(@Username))

    BEGIN

        THROW 50003, 'El nombre de usuario ya está registrado.', 1;

    END;

    BEGIN TRANSACTION;

    INSERT INTO sec.Users (

        RoleId,

        Email,

        Username,

        PasswordHash,

        DisplayName,

        LastPasswordChangeAt

    )

    VALUES (

        @RoleId,

        LOWER(@Email),

        LOWER(@Username),

        @PasswordHash,

        @DisplayName,

        SYSDATETIME()

    );

    SET @NewUserId = SCOPE_IDENTITY();

    INSERT INTO sec.UserProfiles (UserId)

    VALUES (@NewUserId);

    EXEC audit.usp_WriteAuditLog

        @ActorUserId = @ActorUserId,

        @ActionName = N'USER_REGISTER',

        @EntityName = N'sec.Users',

        @EntityId = @NewUserId,

        @NewData = @Email;

    COMMIT TRANSACTION;

END
GO

CREATE OR ALTER PROCEDURE sec.usp_GetUserByEmail

    @Email NVARCHAR(180)

AS

BEGIN

    SET NOCOUNT ON;

    SELECT

        U.UserId,

        U.Email,

        U.Username,

        U.PasswordHash,

        U.DisplayName,

        U.AccountStatus,

        U.IsEmailVerified,

        U.FailedLoginAttempts,

        U.LastLoginAt,

        R.RoleName

    FROM sec.Users U

    INNER JOIN sec.Roles R ON U.RoleId = R.RoleId

    WHERE U.Email = LOWER(@Email)

    AND U.DeletedAt IS NULL;

END
GO

CREATE OR ALTER PROCEDURE sec.usp_LoginWithGoogle

    @GoogleSub NVARCHAR(255),

    @Email NVARCHAR(180),

    @EmailVerified BIT,

    @DisplayName NVARCHAR(150),

    @AvatarUrl NVARCHAR(1000) = NULL,

    @IpAddress NVARCHAR(80) = NULL,

    @UserAgent NVARCHAR(500) = NULL,

    @UserId BIGINT OUTPUT

AS

BEGIN

    SET NOCOUNT ON;

    SET XACT_ABORT ON;

    DECLARE @GoogleProviderId INT;

    DECLARE @DefaultRoleId INT;

    DECLARE @UsernameBase NVARCHAR(80);

    DECLARE @UsernameFinal NVARCHAR(80);

    DECLARE @Counter INT = 0;

    SELECT @GoogleProviderId = AuthProviderId

    FROM sec.AuthProviders

    WHERE ProviderCode = N'GOOGLE'

    AND IsActive = 1;

    SELECT @DefaultRoleId = RoleId

    FROM sec.Roles

    WHERE RoleName = N'USER'

    AND IsActive = 1;

    IF @GoogleProviderId IS NULL

    BEGIN

        THROW 51001, 'El proveedor Google no está configurado.', 1;

    END;

    IF @DefaultRoleId IS NULL

    BEGIN

        THROW 51002, 'El rol USER no está configurado.', 1;

    END;

    BEGIN TRANSACTION;

    SELECT @UserId = UEL.UserId

    FROM sec.UserExternalLogins UEL

    WHERE UEL.AuthProviderId = @GoogleProviderId

    AND UEL.ProviderUserId = @GoogleSub

    AND UEL.IsActive = 1;

    IF @UserId IS NOT NULL

    BEGIN

        UPDATE sec.UserExternalLogins

        SET ProviderEmail = LOWER(@Email),

            ProviderEmailVerified = @EmailVerified,

            ProviderDisplayName = @DisplayName,

            ProviderAvatarUrl = @AvatarUrl,

            LastLoginAt = SYSDATETIME()

        WHERE AuthProviderId = @GoogleProviderId

        AND ProviderUserId = @GoogleSub;

        UPDATE sec.Users

        SET LastLoginAt = SYSDATETIME(),

            FailedLoginAttempts = 0,

            IsEmailVerified = CASE WHEN @EmailVerified = 1 THEN 1 ELSE IsEmailVerified END,

            GoogleEmail = LOWER(@Email),

            LastAuthProvider = N'GOOGLE',

            UpdatedAt = SYSDATETIME()

        WHERE UserId = @UserId;

        UPDATE sec.UserProfiles

        SET AvatarUrl = COALESCE(@AvatarUrl, AvatarUrl),

            UpdatedAt = SYSDATETIME()

        WHERE UserId = @UserId;

    END

    ELSE

    BEGIN

        SELECT @UserId = UserId

        FROM sec.Users

        WHERE Email = LOWER(@Email)

        AND DeletedAt IS NULL;

        IF @UserId IS NULL

        BEGIN

            SET @UsernameBase = LOWER(LEFT(REPLACE(REPLACE(@Email, N'@', N'_'), N'.', N'_'), 70));

            SET @UsernameFinal = @UsernameBase;

            WHILE EXISTS (SELECT 1 FROM sec.Users WHERE Username = @UsernameFinal)

            BEGIN

                SET @Counter = @Counter + 1;

                SET @UsernameFinal = LEFT(@UsernameBase, 70) + N'_' + CAST(@Counter AS NVARCHAR(10));

            END;

            INSERT INTO sec.Users (

                RoleId,

                Email,

                Username,

                PasswordHash,

                DisplayName,

                AccountStatus,

                IsEmailVerified,

                LastLoginAt,

                LastPasswordChangeAt,

                PrimaryAuthProviderId,

                GoogleEmail,

                LastAuthProvider

            )

            VALUES (

                @DefaultRoleId,

                LOWER(@Email),

                @UsernameFinal,

                N'GOOGLE_AUTH_NO_LOCAL_PASSWORD',

                @DisplayName,

                N'ACTIVE',

                @EmailVerified,

                SYSDATETIME(),

                NULL,

                @GoogleProviderId,

                LOWER(@Email),

                N'GOOGLE'

            );

            SET @UserId = SCOPE_IDENTITY();

            INSERT INTO sec.UserProfiles (

                UserId,

                AvatarUrl

            )

            VALUES (

                @UserId,

                @AvatarUrl

            );

        END

        ELSE

        BEGIN

            UPDATE sec.Users

            SET IsEmailVerified = CASE WHEN @EmailVerified = 1 THEN 1 ELSE IsEmailVerified END,

                GoogleEmail = LOWER(@Email),

                LastAuthProvider = N'GOOGLE',

                LastLoginAt = SYSDATETIME(),

                FailedLoginAttempts = 0,

                UpdatedAt = SYSDATETIME()

            WHERE UserId = @UserId;

            UPDATE sec.UserProfiles

            SET AvatarUrl = COALESCE(@AvatarUrl, AvatarUrl),

                UpdatedAt = SYSDATETIME()

            WHERE UserId = @UserId;

        END;

        INSERT INTO sec.UserExternalLogins (

            UserId,

            AuthProviderId,

            ProviderUserId,

            ProviderEmail,

            ProviderEmailVerified,

            ProviderDisplayName,

            ProviderAvatarUrl,

            LastLoginAt

        )

        VALUES (

            @UserId,

            @GoogleProviderId,

            @GoogleSub,

            LOWER(@Email),

            @EmailVerified,

            @DisplayName,

            @AvatarUrl,

            SYSDATETIME()

        );

    END;

    EXEC audit.usp_WriteAuditLog

        @ActorUserId = @UserId,

        @ActionName = N'LOGIN_GOOGLE',

        @EntityName = N'sec.Users',

        @EntityId = @UserId,

        @NewData = @Email,

        @IpAddress = @IpAddress,

        @UserAgent = @UserAgent;

    COMMIT TRANSACTION;

END
GO

CREATE OR ALTER PROCEDURE content.usp_CreateMediaAsset

    @OwnerUserId BIGINT,

    @BucketName NVARCHAR(120),

    @ObjectKey NVARCHAR(600),

    @MediaUrl NVARCHAR(1000),

    @MediaKind NVARCHAR(20),

    @MimeType NVARCHAR(120),

    @OriginalFileName NVARCHAR(260) = NULL,

    @SizeBytes BIGINT,

    @WidthPx INT = NULL,

    @HeightPx INT = NULL,

    @DurationSeconds INT = NULL,

    @ChecksumSha256 NVARCHAR(128) = NULL,

    @NewMediaId BIGINT OUTPUT

AS

BEGIN

    SET NOCOUNT ON;

    INSERT INTO content.MediaAssets (

        OwnerUserId,

        BucketName,

        ObjectKey,

        MediaUrl,

        MediaKind,

        MimeType,

        OriginalFileName,

        SizeBytes,

        WidthPx,

        HeightPx,

        DurationSeconds,

        ChecksumSha256

    )

    VALUES (

        @OwnerUserId,

        @BucketName,

        @ObjectKey,

        @MediaUrl,

        @MediaKind,

        @MimeType,

        @OriginalFileName,

        @SizeBytes,

        @WidthPx,

        @HeightPx,

        @DurationSeconds,

        @ChecksumSha256

    );

    SET @NewMediaId = SCOPE_IDENTITY();

    EXEC audit.usp_WriteAuditLog

        @ActorUserId = @OwnerUserId,

        @ActionName = N'MEDIA_CREATE',

        @EntityName = N'content.MediaAssets',

        @EntityId = @NewMediaId,

        @NewData = @ObjectKey;

END
GO

CREATE OR ALTER PROCEDURE content.usp_CreatePin

    @OwnerUserId BIGINT,

    @BoardId BIGINT = NULL,

    @CategoryId INT = NULL,

    @Title NVARCHAR(160),

    @Description NVARCHAR(1000) = NULL,

    @SourceUrl NVARCHAR(600) = NULL,

    @Visibility NVARCHAR(20) = N'PUBLIC',

    @IsAiGenerated BIT = 0,

    @IsSensitive BIT = 0,

    @MediaId BIGINT = NULL,

    @TagsCsv NVARCHAR(MAX) = NULL,

    @NewPinId BIGINT OUTPUT

AS

BEGIN

    SET NOCOUNT ON;

    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    INSERT INTO content.Pins (

        OwnerUserId,

        BoardId,

        CategoryId,

        Title,

        Description,

        SourceUrl,

        Visibility,

        IsAiGenerated,

        IsSensitive

    )

    VALUES (

        @OwnerUserId,

        @BoardId,

        @CategoryId,

        @Title,

        @Description,

        @SourceUrl,

        @Visibility,

        @IsAiGenerated,

        @IsSensitive

    );

    SET @NewPinId = SCOPE_IDENTITY();

    IF @MediaId IS NOT NULL

    BEGIN

        INSERT INTO content.PinMedia (PinId, MediaId, SortOrder)

        VALUES (@NewPinId, @MediaId, 1);

    END;

    IF @TagsCsv IS NOT NULL AND LEN(LTRIM(RTRIM(@TagsCsv))) > 0

    BEGIN

        WITH TagValues AS (

            SELECT DISTINCT

                LOWER(TRIM(value)) AS Name,

                LOWER(REPLACE(TRIM(value), N' ', N'-')) AS Slug

            FROM STRING_SPLIT(@TagsCsv, N',')

            WHERE LEN(TRIM(value)) > 0

        )

        INSERT INTO core.Tags (Name, Slug)

        SELECT Name, Slug

        FROM TagValues TV

        WHERE NOT EXISTS (

            SELECT 1

            FROM core.Tags T

            WHERE T.Slug = TV.Slug

        );

        INSERT INTO content.PinTags (PinId, TagId)

        SELECT @NewPinId, T.TagId

        FROM core.Tags T

        INNER JOIN (

            SELECT DISTINCT LOWER(REPLACE(TRIM(value), N' ', N'-')) AS Slug

            FROM STRING_SPLIT(@TagsCsv, N',')

            WHERE LEN(TRIM(value)) > 0

        ) X ON X.Slug = T.Slug

        WHERE NOT EXISTS (

            SELECT 1

            FROM content.PinTags PT

            WHERE PT.PinId = @NewPinId

            AND PT.TagId = T.TagId

        );

        UPDATE T

        SET UseCount = UseCount + 1

        FROM core.Tags T

        INNER JOIN content.PinTags PT ON PT.TagId = T.TagId

        WHERE PT.PinId = @NewPinId;

    END;

    EXEC audit.usp_WriteAuditLog

        @ActorUserId = @OwnerUserId,

        @ActionName = N'PIN_CREATE',

        @EntityName = N'content.Pins',

        @EntityId = @NewPinId,

        @NewData = @Title;

    COMMIT TRANSACTION;

END
GO

CREATE OR ALTER PROCEDURE content.usp_GetPinDetail @PinId INT, @ViewerUserId INT = NULL, @IpAddress NVARCHAR(50) = NULL, @UserAgent NVARCHAR(500) = NULL AS BEGIN SET NOCOUNT ON; UPDATE content.Pins SET ViewsCount = ViewsCount + 1 WHERE PinId = @PinId; SELECT p.PinId, p.Title, p.Description, p.SourceUrl, p.Status, p.Visibility, p.IsAiGenerated, p.IsSensitive, p.SavesCount, p.CommentsCount, p.ReactionsCount, p.ViewsCount, p.CreatedAt, p.PublishedAt, p.OwnerUserId, u.Username, u.DisplayName, up.AvatarUrl, p.BoardId, b.Name AS BoardName, p.CategoryId, c.Name AS CategoryName, CAST(CASE WHEN ps.UserId IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsSavedByViewer, m.MediaUrl, m.MediaKind FROM content.Pins p LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId LEFT JOIN content.MediaAssets m ON pm.MediaId = m.MediaId LEFT JOIN sec.Users u ON p.OwnerUserId = u.UserId LEFT JOIN sec.UserProfiles up ON u.UserId = up.UserId LEFT JOIN content.Boards b ON p.BoardId = b.BoardId LEFT JOIN core.Categories c ON p.CategoryId = c.CategoryId LEFT JOIN content.PinSaves ps ON p.PinId = ps.PinId AND ps.UserId = @ViewerUserId WHERE p.PinId = @PinId; SELECT T.TagId, T.Name, T.Slug FROM content.PinTags PT INNER JOIN core.Tags T ON T.TagId = PT.TagId WHERE PT.PinId = @PinId ORDER BY T.Name; SELECT C.CommentId, C.ParentCommentId, C.CommentText, C.CreatedAt, C.UpdatedAt, U.UserId, U.Username, U.DisplayName, UP.AvatarUrl FROM content.Comments C INNER JOIN sec.Users U ON U.UserId = C.UserId LEFT JOIN sec.UserProfiles UP ON UP.UserId = U.UserId WHERE C.PinId = @PinId AND C.Status = N'VISIBLE' AND C.DeletedAt IS NULL ORDER BY C.CreatedAt DESC; END;
GO

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

        P.PinId,

        P.Title,

        P.Description,

        P.Status,

        P.Visibility,

        P.SavesCount,

        P.CommentsCount,

        P.ReactionsCount,

        P.ViewsCount,

        P.CreatedAt,

        P.PublishedAt,

        U.UserId AS OwnerUserId,

        U.Username,

        U.DisplayName,

        C.CategoryId,

        C.Name AS CategoryName,

        M.MediaId,

        M.MediaUrl,

        M.MediaKind,

        M.WidthPx,

        M.HeightPx,

        CASE WHEN PS.UserId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS IsSavedByViewer

    FROM content.Pins P

    INNER JOIN sec.Users U ON U.UserId = P.OwnerUserId

    LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId

    OUTER APPLY (

        SELECT TOP 1

            MA.MediaId,

            MA.MediaUrl,

            MA.MediaKind,

            MA.WidthPx,

            MA.HeightPx

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

CREATE OR ALTER PROCEDURE content.usp_SearchPins

    @Search NVARCHAR(200) = NULL,

    @CategoryId INT = NULL,

    @TagSlug NVARCHAR(100) = NULL,

    @ViewerUserId BIGINT = NULL,

    @PageNumber INT = 1,

    @PageSize INT = 30

AS

BEGIN

    SET NOCOUNT ON;

    IF @PageNumber < 1 SET @PageNumber = 1;

    IF @PageSize < 1 SET @PageSize = 30;

    IF @PageSize > 100 SET @PageSize = 100;

    SELECT DISTINCT

        P.PinId,

        P.Title,

        P.Description,

        P.SavesCount,

        P.CommentsCount,

        P.ReactionsCount,

        P.ViewsCount,

        P.PublishedAt,

        U.Username,

        U.DisplayName,

        C.Name AS CategoryName,

        M.MediaUrl,

        M.MediaKind,

        CASE WHEN PS.UserId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS IsSavedByViewer

    FROM content.Pins P

    INNER JOIN sec.Users U ON U.UserId = P.OwnerUserId

    LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId

    LEFT JOIN content.PinTags PT ON PT.PinId = P.PinId

    LEFT JOIN core.Tags T ON T.TagId = PT.TagId

    OUTER APPLY (

        SELECT TOP 1

            MA.MediaUrl,

            MA.MediaKind

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

    AND (@TagSlug IS NULL OR T.Slug = @TagSlug)

    AND (

        @Search IS NULL

        OR P.Title LIKE N'%' + @Search + N'%'

        OR P.Description LIKE N'%' + @Search + N'%'

        OR T.Name LIKE N'%' + @Search + N'%'

    )

    ORDER BY P.PublishedAt DESC

    OFFSET (@PageNumber - 1) * @PageSize ROWS

    FETCH NEXT @PageSize ROWS ONLY;

END
GO

CREATE OR ALTER PROCEDURE content.usp_UpdatePinStatus

    @PinId BIGINT,

    @Status NVARCHAR(30),

    @ActorUserId BIGINT

AS

BEGIN

    SET NOCOUNT ON;

    UPDATE content.Pins

    SET Status = @Status,

        PublishedAt = CASE WHEN @Status = N'APPROVED' AND PublishedAt IS NULL THEN SYSDATETIME() ELSE PublishedAt END,

        UpdatedAt = SYSDATETIME()

    WHERE PinId = @PinId

    AND DeletedAt IS NULL;

    UPDATE MA

    SET ModerationStatus = CASE WHEN @Status IN (N'APPROVED', N'REJECTED', N'HIDDEN') THEN @Status ELSE MA.ModerationStatus END,

        UpdatedAt = SYSDATETIME()

    FROM content.MediaAssets MA

    INNER JOIN content.PinMedia PM ON PM.MediaId = MA.MediaId

    WHERE PM.PinId = @PinId;

    EXEC audit.usp_WriteAuditLog

        @ActorUserId = @ActorUserId,

        @ActionName = N'PIN_STATUS_UPDATE',

        @EntityName = N'content.Pins',

        @EntityId = @PinId,

        @NewData = @Status;

END
GO

CREATE OR ALTER PROCEDURE moderation.usp_ReportEntity

    @ReporterUserId BIGINT,

    @EntityType NVARCHAR(30),

    @EntityId BIGINT,

    @Reason NVARCHAR(120),

    @Details NVARCHAR(1000) = NULL,

    @NewReportId BIGINT OUTPUT

AS

BEGIN

    SET NOCOUNT ON;

    INSERT INTO moderation.Reports (

        ReporterUserId,

        EntityType,

        EntityId,

        Reason,

        Details

    )

    VALUES (

        @ReporterUserId,

        @EntityType,

        @EntityId,

        @Reason,

        @Details

    );

    SET @NewReportId = SCOPE_IDENTITY();

    IF @EntityType = N'PIN'

    BEGIN

        UPDATE content.Pins

        SET Status = CASE WHEN Status = N'APPROVED' THEN N'HIDDEN' ELSE Status END,

            UpdatedAt = SYSDATETIME()

        WHERE PinId = @EntityId;

    END;

    IF @EntityType = N'COMMENT'

    BEGIN

        UPDATE content.Comments

        SET Status = N'REPORTED',

            UpdatedAt = SYSDATETIME()

        WHERE CommentId = @EntityId;

    END;

    EXEC audit.usp_WriteAuditLog

        @ActorUserId = @ReporterUserId,

        @ActionName = N'ENTITY_REPORT',

        @EntityName = @EntityType,

        @EntityId = @EntityId,

        @NewData = @Reason;

END
GO

USE NexusDB;
GO

DECLARE @uq_name NVARCHAR(200);
SELECT TOP 1 @uq_name = kc.name
FROM sys.key_constraints kc
JOIN sys.index_columns ic1 ON ic1.object_id = kc.parent_object_id AND ic1.index_id = kc.unique_index_id
JOIN sys.columns c1 ON c1.object_id = ic1.object_id AND c1.column_id = ic1.column_id AND c1.name = 'PinId'
JOIN sys.index_columns ic2 ON ic2.object_id = kc.parent_object_id AND ic2.index_id = kc.unique_index_id
JOIN sys.columns c2 ON c2.object_id = ic2.object_id AND c2.column_id = ic2.column_id AND c2.name = 'UserId'
JOIN sys.tables t ON kc.parent_object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE kc.type = 'UQ' AND s.name = 'content' AND t.name = 'Comments';
IF @uq_name IS NOT NULL
    EXEC('ALTER TABLE content.Comments DROP CONSTRAINT [' + @uq_name + ']');
GO

DECLARE @ix_name NVARCHAR(200);
SELECT TOP 1 @ix_name = i.name
FROM sys.indexes i
JOIN sys.index_columns ic1 ON ic1.object_id = i.object_id AND ic1.index_id = i.index_id
JOIN sys.columns c1 ON c1.object_id = ic1.object_id AND c1.column_id = ic1.column_id AND c1.name = 'PinId'
JOIN sys.index_columns ic2 ON ic2.object_id = i.object_id AND ic2.index_id = i.index_id
JOIN sys.columns c2 ON c2.object_id = ic2.object_id AND c2.column_id = ic2.column_id AND c2.name = 'UserId'
JOIN sys.tables t ON i.object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE i.is_unique = 1 AND i.is_primary_key = 0
  AND s.name = 'content' AND t.name = 'Comments';
IF @ix_name IS NOT NULL
    EXEC('DROP INDEX [' + @ix_name + '] ON content.Comments');
GO

IF COL_LENGTH('content.Comments', 'CommentText') IS NULL
    ALTER TABLE content.Comments ADD CommentText NVARCHAR(MAX) NULL;
GO
IF COL_LENGTH('content.Comments', 'Status') IS NULL
    ALTER TABLE content.Comments ADD Status NVARCHAR(30) NOT NULL DEFAULT N'VISIBLE';
GO
IF COL_LENGTH('content.Comments', 'DeletedAt') IS NULL
    ALTER TABLE content.Comments ADD DeletedAt DATETIME2 NULL;
GO
IF COL_LENGTH('content.Comments', 'ParentCommentId') IS NULL
    ALTER TABLE content.Comments ADD ParentCommentId INT NULL;
GO

GO

IF COL_LENGTH('moderation.Decisions', 'Notes') IS NULL
    ALTER TABLE moderation.Decisions ADD Notes NVARCHAR(MAX) NULL;
GO

IF OBJECT_ID('content.PinReactions', 'U') IS NULL
BEGIN
    CREATE TABLE content.PinReactions (
        UserId      INT NOT NULL REFERENCES sec.Users(UserId),
        PinId       INT NOT NULL REFERENCES content.Pins(PinId),
        ReactionType NVARCHAR(30) NOT NULL DEFAULT N'LIKE',
        CreatedAt   DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (UserId, PinId)
    );
END
GO

CREATE OR ALTER PROCEDURE content.usp_AddComment
    @PinId          INT,
    @UserId         INT,
    @CommentText    NVARCHAR(MAX),
    @ParentCommentId INT = NULL,
    @NewCommentId   INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF LEN(LTRIM(RTRIM(@CommentText))) = 0
    BEGIN
        RAISERROR(N'El comentario no puede estar vacío.', 16, 1);
        RETURN;
    END

    INSERT INTO content.Comments
        (PinId, UserId, CommentText, ParentCommentId, Status, CreatedAt)
    VALUES
        (@PinId, @UserId, @CommentText, @ParentCommentId, N'VISIBLE', GETDATE());

    SET @NewCommentId = CAST(SCOPE_IDENTITY() AS INT);

    UPDATE content.Pins
    SET CommentsCount = CommentsCount + 1
    WHERE PinId = @PinId;
END
GO

CREATE OR ALTER PROCEDURE content.usp_SetPinReaction
    @UserId       INT,
    @PinId        INT,
    @ReactionType NVARCHAR(30) = N'LIKE'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM content.PinReactions
        WHERE UserId = @UserId AND PinId = @PinId
    )
    BEGIN
        INSERT INTO content.PinReactions (UserId, PinId, ReactionType)
        VALUES (@UserId, @PinId, @ReactionType);

        UPDATE content.Pins
        SET ReactionsCount = ReactionsCount + 1
        WHERE PinId = @PinId;
    END
END
GO

CREATE OR ALTER PROCEDURE content.usp_SavePin
    @UserId  INT,
    @PinId   INT,
    @BoardId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM content.PinSaves
        WHERE UserId = @UserId AND PinId = @PinId
    )
    BEGIN
        INSERT INTO content.PinSaves (UserId, PinId, SavedAt)
        VALUES (@UserId, @PinId, GETDATE());

        UPDATE content.Pins
        SET SavesCount = SavesCount + 1
        WHERE PinId = @PinId;
    END
END
GO

CREATE OR ALTER PROCEDURE content.usp_UnsavePin
    @UserId INT,
    @PinId  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM content.PinSaves
        WHERE UserId = @UserId AND PinId = @PinId
    )
    BEGIN
        DELETE FROM content.PinSaves
        WHERE UserId = @UserId AND PinId = @PinId;

        UPDATE content.Pins
        SET SavesCount = CASE WHEN SavesCount > 0 THEN SavesCount - 1 ELSE 0 END
        WHERE PinId = @PinId;
    END
END
GO

GO

PRINT N'08_comments_reactions aplicado correctamente.';
GO

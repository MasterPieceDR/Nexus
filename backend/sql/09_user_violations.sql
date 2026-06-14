IF NOT EXISTS (
    SELECT 1 FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE s.name = 'moderation' AND t.name = 'UserViolations'
)
BEGIN
    CREATE TABLE moderation.UserViolations (
        ViolationId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId      BIGINT NOT NULL REFERENCES sec.Users(UserId),
        PinId       BIGINT NULL REFERENCES content.Pins(PinId),
        Reason      NVARCHAR(500) NULL,
        CreatedAt   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
    CREATE INDEX IX_UserViolations_UserId
        ON moderation.UserViolations (UserId);
END

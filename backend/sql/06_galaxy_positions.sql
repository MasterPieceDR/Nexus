USE NexusDB;
GO
IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE s.name = N'content'
    AND t.name = N'ConstellationNodePositions'
)
BEGIN
    CREATE TABLE content.ConstellationNodePositions (
        BoardId BIGINT NOT NULL,
        PinId BIGINT NOT NULL,
        XPercent DECIMAL(5,2) NOT NULL,
        YPercent DECIMAL(5,2) NOT NULL,
        StarSize INT NOT NULL DEFAULT 16,
        StarColor NVARCHAR(30) NOT NULL DEFAULT N'#00ff38',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT PK_ConstellationNodePositions PRIMARY KEY (BoardId, PinId),
        CONSTRAINT FK_ConstellationNodePositions_Boards FOREIGN KEY (BoardId) REFERENCES content.Boards(BoardId),
        CONSTRAINT FK_ConstellationNodePositions_Pins FOREIGN KEY (PinId) REFERENCES content.Pins(PinId)
    );
END
GO
INSERT INTO content.ConstellationNodePositions (
    BoardId,
    PinId,
    XPercent,
    YPercent,
    StarSize,
    StarColor
)
SELECT
    P.BoardId,
    P.PinId,
    CAST((ABS(CAST(CHECKSUM(P.PinId, P.BoardId, 'x') AS BIGINT)) % 78 + 10) AS DECIMAL(5,2)),
    CAST((ABS(CAST(CHECKSUM(P.PinId, P.BoardId, 'y') AS BIGINT)) % 68 + 14) AS DECIMAL(5,2)),
    CAST((ABS(CAST(CHECKSUM(P.PinId, P.BoardId, 's') AS BIGINT)) % 18 + 12) AS INT),
    CASE ABS(CAST(CHECKSUM(P.PinId, P.BoardId, 'c') AS BIGINT)) % 5
        WHEN 0 THEN N'#00ff38'
        WHEN 1 THEN N'#22c55e'
        WHEN 2 THEN N'#84cc16'
        WHEN 3 THEN N'#10b981'
        ELSE N'#4ade80'
    END
FROM content.Pins P
WHERE P.BoardId IS NOT NULL
AND P.DeletedAt IS NULL
AND NOT EXISTS (
    SELECT 1
    FROM content.ConstellationNodePositions CNP
    WHERE CNP.BoardId = P.BoardId
    AND CNP.PinId = P.PinId
);
GO
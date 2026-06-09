USE NexusDB;
GO
DECLARE @OwnerUserId BIGINT;
SELECT TOP 1 @OwnerUserId = UserId
FROM sec.Users
WHERE DeletedAt IS NULL
ORDER BY UserId;
DECLARE @Map TABLE (
    BoardSlug NVARCHAR(140),
    CategorySlug NVARCHAR(120)
);
INSERT INTO @Map (BoardSlug, CategorySlug)
VALUES
(N'galaxia-cloud', N'cloud-computing'),
(N'orbita-sql-server', N'bases-de-datos'),
(N'nucleo-ciberseguridad', N'ciberseguridad'),
(N'red-inteligencia-artificial', N'inteligencia-artificial'),
(N'constelacion-ui-ux', N'diseno-ui-ux'),
(N'universo-web', N'programacion-web'),
(N'ruta-devops', N'devops'),
(N'malla-redes', N'redes'),
(N'laboratorio-prototipos', N'prototipos'),
(N'ecosistema-tech-verde', N'sostenibilidad-tech');
;WITH CandidatePins AS (
    SELECT
        P.PinId,
        B.BoardId,
        ROW_NUMBER() OVER (
            PARTITION BY B.BoardId
            ORDER BY NEWID()
        ) AS RowNumber
    FROM @Map M
    INNER JOIN content.Boards B
        ON B.Slug = M.BoardSlug
        AND B.OwnerUserId = @OwnerUserId
        AND B.DeletedAt IS NULL
    INNER JOIN core.Categories C
        ON C.Slug = M.CategorySlug
    INNER JOIN content.Pins P
        ON P.CategoryId = C.CategoryId
        AND P.DeletedAt IS NULL
        AND P.Status IN (N'APPROVED', N'PENDING')
)
UPDATE P
SET
    P.BoardId = CP.BoardId,
    P.UpdatedAt = SYSDATETIME()
FROM content.Pins P
INNER JOIN CandidatePins CP
    ON CP.PinId = P.PinId
WHERE CP.RowNumber <= 15;
GO
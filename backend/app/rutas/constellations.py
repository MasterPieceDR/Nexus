from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.connection import get_connection, fetch_all
from app.esquemas.constellation_schema import ConstellationCreate, AddPinToConstellation
from app.seguridad.dependencies import get_current_user

router = APIRouter(prefix="/api/constellations", tags=["Constellations"])


@router.get("")
def get_public_constellations(search: str | None = Query(default=None)):
    try:
        query = """
        EXEC content.usp_GetPublicConstellations
            @Search = ?
        """
        return fetch_all(query, [search])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/me")
def get_my_constellations(current_user: dict = Depends(get_current_user)):
    try:
        query = """
        EXEC content.usp_GetMyConstellations
            @OwnerUserId = ?
        """
        return fetch_all(query, [current_user["UserId"]])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("")
def create_constellation(payload: ConstellationCreate, current_user: dict = Depends(get_current_user)):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            board_id = 0
            cursor.execute(
                """
                DECLARE @NewBoardId BIGINT;
                EXEC content.usp_CreateConstellation
                    @OwnerUserId = ?,
                    @Name = ?,
                    @Description = ?,
                    @Visibility = ?,
                    @NewBoardId = @NewBoardId OUTPUT;
                SELECT @NewBoardId AS BoardId;
                """,
                current_user["UserId"],
                payload.name,
                payload.description,
                payload.visibility
            )
            row = cursor.fetchone()
            conn.commit()

            if row:
                board_id = row.BoardId

            return {
                "BoardId": board_id,
                "message": "Constelación creada correctamente"
            }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/{board_id}")
def get_constellation_detail(board_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    B.BoardId,
                    B.Name,
                    B.Slug,
                    B.Description,
                    B.Visibility,
                    B.CreatedAt,
                    U.UserId AS OwnerUserId,
                    U.Username,
                    U.DisplayName
                FROM content.Boards B
                INNER JOIN sec.Users U ON U.UserId = B.OwnerUserId
                WHERE B.BoardId = ?
                AND B.DeletedAt IS NULL
                """,
                board_id
            )

            board_row = cursor.fetchone()

            if not board_row:
                raise HTTPException(status_code=404, detail="Constelación no encontrada")

            board_columns = [column[0] for column in cursor.description]
            board = dict(zip(board_columns, board_row))

            cursor.execute(
                """
                SELECT
                    P.PinId,
                    P.Title,
                    P.Description,
                    P.Status,
                    P.Visibility,
                    P.CreatedAt,
                    P.PublishedAt,
                    C.Name AS CategoryName,
                    MA.MediaUrl,
                    MA.MediaKind
                FROM content.Pins P
                LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId
                OUTER APPLY (
                    SELECT TOP 1
                        M.MediaUrl,
                        M.MediaKind
                    FROM content.PinMedia PM
                    INNER JOIN content.MediaAssets M ON M.MediaId = PM.MediaId
                    WHERE PM.PinId = P.PinId
                    ORDER BY PM.SortOrder ASC
                ) MA
                WHERE P.BoardId = ?
                AND P.Status = N'APPROVED'
                AND P.DeletedAt IS NULL
                ORDER BY P.PublishedAt DESC, P.CreatedAt DESC
                """,
                board_id
            )

            pin_columns = [column[0] for column in cursor.description]
            pins = [dict(zip(pin_columns, row)) for row in cursor.fetchall()]

            return {
                "constellation": board,
                "nodes": pins
            }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/{board_id}/galaxy")
def get_constellation_galaxy(board_id: int):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    B.BoardId,
                    B.Name,
                    B.Description,
                    B.Visibility,
                    U.DisplayName,
                    U.Username
                FROM content.Boards B
                INNER JOIN sec.Users U ON U.UserId = B.OwnerUserId
                WHERE B.BoardId = ?
                AND B.DeletedAt IS NULL
                """,
                board_id
            )

            board_row = cursor.fetchone()

            if not board_row:
                raise HTTPException(status_code=404, detail="Constelación no encontrada")

            board_columns = [column[0] for column in cursor.description]
            board = dict(zip(board_columns, board_row))

            cursor.execute(
                """
                SELECT
                    P.PinId,
                    P.Title,
                    P.Description,
                    P.PublishedAt,
                    C.Name AS CategoryName,
                    MA.MediaUrl,
                    MA.MediaKind,
                    CNP.XPercent,
                    CNP.YPercent,
                    CNP.StarSize,
                    CNP.StarColor
                FROM content.Pins P
                INNER JOIN content.ConstellationNodePositions CNP
                    ON CNP.PinId = P.PinId
                    AND CNP.BoardId = P.BoardId
                LEFT JOIN core.Categories C ON C.CategoryId = P.CategoryId
                OUTER APPLY (
                    SELECT TOP 1
                        M.MediaUrl,
                        M.MediaKind
                    FROM content.PinMedia PM
                    INNER JOIN content.MediaAssets M ON M.MediaId = PM.MediaId
                    WHERE PM.PinId = P.PinId
                    ORDER BY PM.SortOrder ASC
                ) MA
                WHERE P.BoardId = ?
                AND P.Status = N'APPROVED'
                AND P.DeletedAt IS NULL
                ORDER BY P.PublishedAt DESC, P.CreatedAt DESC
                """,
                board_id
            )

            node_columns = [column[0] for column in cursor.description]
            nodes = [dict(zip(node_columns, row)) for row in cursor.fetchall()]

            return {
                "constellation": board,
                "nodes": nodes
            }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.post("/{board_id}/pins")
def add_pin_to_constellation(board_id: int, payload: AddPinToConstellation, current_user: dict = Depends(get_current_user)):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                EXEC content.usp_AddPinToConstellation
                    @OwnerUserId = ?,
                    @BoardId = ?,
                    @PinId = ?
                """,
                current_user["UserId"],
                board_id,
                payload.pin_id
            )
            conn.commit()

            return {
                "message": "Nodo agregado a la constelación correctamente"
            }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

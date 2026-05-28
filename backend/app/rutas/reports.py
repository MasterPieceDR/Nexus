from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Post, Report, User
from ..esquemas.report_schema import ReportCreate, ReportOut
from ..seguridad.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportOut)
def create_report(payload: ReportCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == payload.post_id).first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    report = Report(post_id=payload.post_id, user_id=user.id, reason=payload.reason.strip())
    db.add(report)
    db.commit()
    db.refresh(report)

    return report

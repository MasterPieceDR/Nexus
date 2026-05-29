from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from ..config import settings
from ..db import get_db
from ..models import Category, Comment, Post, User
from ..esquemas.post_schema import PostCreate, PostOut, PostStatusUpdate
from ..esquemas.comment_schema import CommentCreate, CommentOut
from ..seguridad.dependencies import get_current_user, get_optional_user, require_admin
from ..services.s3_service import create_presigned_get_url

router = APIRouter(prefix="/posts", tags=["posts"])


def post_to_out(post: Post) -> dict:
    ratio = "16 / 9" if "video" in post.media_type else "4 / 5"
    return {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "tags": post.tags,
        "category_id": post.category_id,
        "category_name": post.category.name if post.category else None,
        "author_name": post.user.full_name if post.user else None,
        "media_url": create_presigned_get_url(post.s3_key),
        "media_type": post.media_type,
        "status": post.status,
        "created_at": post.created_at,
        "visual_ratio": ratio
    }


@router.get("", response_model=list[PostOut])
def list_posts(
    search: str | None = Query(default=None, max_length=120),
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Post).options(joinedload(Post.category), joinedload(Post.user)).filter(Post.status == "APPROVED")

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(or_(Post.title.like(pattern), Post.description.like(pattern), Post.tags.like(pattern)))

    if category_id:
        query = query.filter(Post.category_id == category_id)

    posts = query.order_by(Post.created_at.desc()).limit(60).all()
    return [post_to_out(post) for post in posts]


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    post = db.query(Post).options(joinedload(Post.category), joinedload(Post.user)).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    is_owner = user and post.user_id == user.id
    is_admin = user and user.role == "ADMIN"

    if post.status != "APPROVED" and not is_owner and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Publicación no disponible")

    return post_to_out(post)


@router.post("", response_model=PostOut)
def create_post(payload: PostCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == payload.category_id, Category.is_active == True).first()

    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    status_value = "APPROVED" if settings.auto_approve_posts else "PENDING"
    post = Post(
        user_id=user.id,
        category_id=payload.category_id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        tags=payload.tags.strip() if payload.tags else None,
        s3_key=payload.s3_key,
        media_type=payload.media_type,
        status=status_value
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post.category = category
    post.user = user
    return post_to_out(post)


@router.patch("/{post_id}/status", response_model=PostOut)
def update_post_status(post_id: int, payload: PostStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    post = db.query(Post).options(joinedload(Post.category), joinedload(Post.user)).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    post.status = payload.status
    db.commit()
    db.refresh(post)
    return post_to_out(post)


@router.get("/{post_id}/comments", response_model=list[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).options(joinedload(Comment.user)).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).all()
    return [
        {
            "id": comment.id,
            "content": comment.content,
            "author_name": comment.user.full_name if comment.user else "Usuario",
            "created_at": comment.created_at
        }
        for comment in comments
    ]


@router.post("/{post_id}/comments", response_model=CommentOut)
def create_comment(post_id: int, payload: CommentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada")

    comment = Comment(post_id=post_id, user_id=user.id, content=payload.content.strip())
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content,
        "author_name": user.full_name,
        "created_at": comment.created_at
    }

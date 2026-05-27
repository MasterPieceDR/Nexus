from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from ..db import get_db
from ..models import Post, User
from ..esquemas.user_schema import UserPublic
from ..esquemas.post_schema import PostOut
from ..seguridad.dependencies import get_current_user
from .posts import post_to_out

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.get("/me/posts", response_model=list[PostOut])
def get_my_posts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    posts = db.query(Post).options(joinedload(Post.category), joinedload(Post.user)).filter(Post.user_id == user.id).order_by(Post.created_at.desc()).all()
    return [post_to_out(post) for post in posts]

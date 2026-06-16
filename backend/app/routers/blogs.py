"""Blog router: list/get for public, CRUD for admin."""
import re
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import forbidden, not_found
from app.db import Blog, BlogCategory, User, get_db
from app.deps import get_current_user, require_admin
from app.schemas import BlogCategoryOut, BlogIn, BlogOut

router = APIRouter(prefix="/blogs", tags=["blogs"])


def _slugify(title: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    return s or "post"


@router.get("/categories", response_model=list[BlogCategoryOut])
def list_categories(db: Session = Depends(get_db)) -> list[BlogCategoryOut]:
    return [BlogCategoryOut.model_validate(c) for c in db.query(BlogCategory).all()]


@router.get("", response_model=list[BlogOut])
def list_blogs(
    category: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
) -> list[BlogOut]:
    query = db.query(Blog).filter(Blog.published == True)  # noqa: E712
    if category:
        cat = db.query(BlogCategory).filter(BlogCategory.slug == category).first()
        if cat:
            query = query.filter(Blog.category_id == cat.id)
    if q:
        like = f"%{q}%"
        query = query.filter((Blog.title.ilike(like)) | (Blog.content.ilike(like)))
    return [BlogOut.model_validate(b) for b in query.order_by(Blog.published_at.desc()).all()]


@router.get("/{slug}", response_model=BlogOut)
def get_blog(slug: str, db: Session = Depends(get_db)) -> BlogOut:
    b = db.query(Blog).filter(Blog.slug == slug, Blog.published == True).first()  # noqa: E712
    if not b:
        raise not_found("blog not found")
    return BlogOut.model_validate(b)


@router.post("", response_model=BlogOut, status_code=201)
def create_blog(
    payload: BlogIn,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> BlogOut:
    b = Blog(
        title=payload.title,
        slug=_slugify(payload.title),
        excerpt=payload.excerpt,
        content=payload.content,
        featured_image=payload.featured_image,
        category_id=payload.category_id,
        tags=payload.tags,
        author_id=user.id,
        published=payload.published,
        published_at=datetime.utcnow() if payload.published else None,
        meta_title=payload.meta_title,
        meta_description=payload.meta_description,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BlogOut.model_validate(b)


@router.patch("/{blog_id}", response_model=BlogOut)
def update_blog(
    blog_id: UUID,
    payload: BlogIn,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> BlogOut:
    b = db.query(Blog).filter(Blog.id == blog_id).first()
    if not b:
        raise not_found("blog not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    if payload.published and not b.published_at:
        b.published_at = datetime.utcnow()
    db.commit()
    db.refresh(b)
    return BlogOut.model_validate(b)


@router.delete("/{blog_id}", status_code=204)
def delete_blog(
    blog_id: UUID,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    b = db.query(Blog).filter(Blog.id == blog_id).first()
    if not b:
        raise not_found("blog not found")
    db.delete(b)
    db.commit()
    return None


# missing import
from datetime import datetime  # noqa: E402

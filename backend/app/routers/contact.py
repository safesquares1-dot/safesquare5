"""Contact messages router: public submit, admin read."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import ContactMessage, User, get_db
from app.deps import require_admin
from app.schemas import ContactIn

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
def submit_message(payload: ContactIn, db: Session = Depends(get_db)) -> dict:
    msg = ContactMessage(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        subject=payload.subject,
        message=payload.message,
    )
    db.add(msg)
    db.commit()
    return {"message": "Thanks — we'll be in touch shortly."}


@router.get("")
def list_messages(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[dict]:
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "email": m.email,
            "subject": m.subject,
            "read": m.read,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    ]

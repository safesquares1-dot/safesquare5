"""Practitioner router: profile, verification."""
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import bad_request, forbidden, not_found
from app.db import Practitioner, User, get_db
from app.deps import get_current_user, require_admin, require_practitioner
from app.schemas import PractitionerIn, PractitionerOut

router = APIRouter(prefix="/practitioners", tags=["practitioners"])


@router.post("/me", response_model=PractitionerOut, status_code=201)
def create_my_profile(
    payload: PractitionerIn,
    user: User = Depends(require_practitioner),
    db: Session = Depends(get_db),
) -> PractitionerOut:
    if user.role != "practitioner":
        raise forbidden("only practitioners can create a profile here")
    existing = db.query(Practitioner).filter(Practitioner.user_id == user.id).first()
    if existing:
        raise bad_request("profile already exists; use PATCH")
    p = Practitioner(
        user_id=user.id,
        profession=payload.profession,
        qualifications=payload.qualifications,
        license_number=payload.license_number,
        bio=payload.bio,
        profile_image=payload.profile_image,
        documents=payload.documents,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return PractitionerOut.model_validate(p)


@router.get("/me", response_model=PractitionerOut)
def get_my_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PractitionerOut:
    p = db.query(Practitioner).filter(Practitioner.user_id == user.id).first()
    if not p:
        raise not_found("practitioner profile not found")
    return PractitionerOut.model_validate(p)


@router.patch("/me", response_model=PractitionerOut)
def update_my_profile(
    payload: PractitionerIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PractitionerOut:
    p = db.query(Practitioner).filter(Practitioner.user_id == user.id).first()
    if not p:
        raise not_found("practitioner profile not found")
    if p.user_id != user.id and user.role != "admin":
        raise forbidden()
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    p.verification_status = "pending"  # re-verification on edit
    db.commit()
    db.refresh(p)
    return PractitionerOut.model_validate(p)


@router.get("", response_model=list[PractitionerOut])
def list_practitioners(
    status: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[PractitionerOut]:
    q = db.query(Practitioner)
    if status:
        q = q.filter(Practitioner.verification_status == status)
    return [PractitionerOut.model_validate(p) for p in q.all()]


@router.post("/{practitioner_id}/verify", response_model=PractitionerOut)
def verify_practitioner(
    practitioner_id: UUID,
    approve: bool = True,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PractitionerOut:
    p = db.query(Practitioner).filter(Practitioner.id == practitioner_id).first()
    if not p:
        raise not_found("practitioner not found")
    p.verification_status = "approved" if approve else "rejected"
    db.commit()
    db.refresh(p)
    return PractitionerOut.model_validate(p)

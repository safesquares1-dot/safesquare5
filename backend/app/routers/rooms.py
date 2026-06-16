"""Room router: list, get, CRUD (admin)."""
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.errors import forbidden, not_found
from app.db import Room, User, get_db
from app.deps import get_current_user, require_admin
from app.schemas import RoomIn, RoomOut

router = APIRouter(prefix="/rooms", tags=["rooms"])


def _to_slug(name: str) -> str:
    return "-".join("".join(c.lower() if c.isalnum() else "-" for c in name).split("-"))


@router.get("", response_model=list[RoomOut])
def list_rooms(
    room_type: str | None = None,
    min_capacity: int | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db),
) -> list[RoomOut]:
    q = db.query(Room).filter(Room.status == "active")
    if room_type:
        q = q.filter(Room.room_type == room_type)
    if min_capacity:
        q = q.filter(Room.capacity >= min_capacity)
    if max_price is not None:
        q = q.filter(Room.hourly_rate <= max_price)
    return [RoomOut.model_validate(r) for r in q.all()]


@router.get("/{room_id}", response_model=RoomOut)
def get_room(room_id: UUID, db: Session = Depends(get_db)) -> RoomOut:
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise not_found("room not found")
    return RoomOut.model_validate(r)


@router.post("", response_model=RoomOut, status_code=201)
def create_room(
    payload: RoomIn,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> RoomOut:
    r = Room(
        name=payload.name,
        slug=_to_slug(payload.name),
        description=payload.description,
        room_type=payload.room_type,
        capacity=payload.capacity,
        hourly_rate=payload.hourly_rate,
        amenities=payload.amenities,
        images=payload.images,
        status=payload.status,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return RoomOut.model_validate(r)


@router.patch("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: UUID,
    payload: RoomIn,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> RoomOut:
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise not_found("room not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return RoomOut.model_validate(r)


@router.delete("/{room_id}", status_code=204)
def delete_room(
    room_id: UUID,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise not_found("room not found")
    db.delete(r)
    db.commit()
    return None

"""Booking router: create / cancel / reschedule / availability."""
from datetime import date as _date, datetime, time
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.errors import bad_request, forbidden, not_found
from app.db import Booking, Practitioner, Room, User, get_db
from app.deps import get_current_user, require_admin, require_practitioner
from app.schemas import BookingIn, BookingOut, BookingUpdate

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _parse_time(t: str) -> time:
    try:
        return datetime.strptime(t, "%H:%M").time()
    except ValueError as e:
        raise bad_request("time must be HH:MM") from e


def _hours(start: str, end: str) -> float:
    s = _parse_time(start)
    e = _parse_time(end)
    delta = (datetime.combine(_date.today(), e) - datetime.combine(_date.today(), s)).total_seconds() / 3600
    if delta <= 0:
        raise bad_request("end_time must be after start_time")
    return delta


@router.get("/availability")
def check_availability(
    room_id: UUID,
    booking_date: _date,
    db: Session = Depends(get_db),
) -> dict:
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise not_found("room not found")
    conflicts = (
        db.query(Booking)
        .filter(
            Booking.room_id == room_id,
            Booking.booking_date == booking_date,
            Booking.status.in_(["pending", "confirmed"]),
        )
        .all()
    )
    booked = [{"start_time": b.start_time, "end_time": b.end_time} for b in conflicts]
    return {"room_id": str(room_id), "date": str(booking_date), "booked_slots": booked}


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(
    payload: BookingIn,
    user: User = Depends(require_practitioner),
    db: Session = Depends(get_db),
) -> BookingOut:
    p = db.query(Practitioner).filter(Practitioner.user_id == user.id).first()
    if not p:
        raise bad_request("create your practitioner profile first")
    if p.verification_status != "approved":
        raise forbidden("practitioner not verified")
    r = db.query(Room).filter(Room.id == payload.room_id).first()
    if not r or r.status != "active":
        raise not_found("room not available")

    _ = _hours(payload.start_time, payload.end_time)

    overlap = (
        db.query(Booking)
        .filter(
            Booking.room_id == payload.room_id,
            Booking.booking_date == payload.booking_date,
            Booking.status.in_(["pending", "confirmed"]),
            or_(
                and_(Booking.start_time <= payload.start_time, Booking.end_time > payload.start_time),
                and_(Booking.start_time < payload.end_time, Booking.end_time >= payload.end_time),
                and_(Booking.start_time >= payload.start_time, Booking.end_time <= payload.end_time),
            ),
        )
        .first()
    )
    if overlap:
        raise bad_request("time slot conflicts with an existing booking")

    hours = _hours(payload.start_time, payload.end_time)
    total = (Decimal(r.hourly_rate) * Decimal(hours)).quantize(Decimal("0.01"))

    b = Booking(
        room_id=payload.room_id,
        practitioner_id=p.id,
        booking_date=payload.booking_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status="confirmed",
        notes=payload.notes,
        total_amount=total,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BookingOut.model_validate(b)


@router.get("/me", response_model=list[BookingOut])
def my_bookings(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[BookingOut]:
    p = db.query(Practitioner).filter(Practitioner.user_id == user.id).first()
    if not p:
        return []
    rows = db.query(Booking).filter(Booking.practitioner_id == p.id).order_by(Booking.booking_date.desc()).all()
    return [BookingOut.model_validate(b) for b in rows]


@router.get("", response_model=list[BookingOut])
def list_bookings(
    status: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[BookingOut]:
    q = db.query(Booking)
    if status:
        q = q.filter(Booking.status == status)
    return [BookingOut.model_validate(b) for b in q.order_by(Booking.booking_date.desc()).all()]


@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking(
    booking_id: UUID,
    payload: BookingUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingOut:
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise not_found("booking not found")
    p = db.query(Practitioner).filter(Practitioner.id == b.practitioner_id).first()
    if user.role != "admin" and (not p or p.user_id != user.id):
        raise forbidden()
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    db.commit()
    db.refresh(b)
    return BookingOut.model_validate(b)


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(
    booking_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise not_found("booking not found")
    p = db.query(Practitioner).filter(Practitioner.id == b.practitioner_id).first()
    if user.role != "admin" and (not p or p.user_id != user.id):
        raise forbidden()
    b.status = "cancelled"
    db.commit()
    return None

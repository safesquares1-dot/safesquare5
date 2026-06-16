"""Admin analytics router."""
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import Booking, Payment, Practitioner, Room, User, get_db
from app.deps import require_admin
from app.schemas import AnalyticsOut

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOut)
def overview(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> AnalyticsOut:
    total_prac = db.query(func.count(Practitioner.id)).scalar() or 0
    active_bookings = db.query(func.count(Booking.id)).filter(Booking.status == "confirmed").scalar() or 0
    revenue = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.payment_status == "paid").scalar() or 0
    total_rooms = db.query(func.count(Room.id)).scalar() or 0
    occupancy = (active_bookings / (total_rooms * 30)) if total_rooms else 0.0
    occupancy = round(min(max(occupancy, 0.0), 1.0), 4)
    return AnalyticsOut(
        total_practitioners=total_prac,
        active_bookings=active_bookings,
        revenue=Decimal(revenue),
        occupancy_rate=occupancy,
        growth_metrics={"practitioners": total_prac, "rooms": total_rooms},
    )


@router.get("/revenue")
def revenue(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(Booking.booking_date, func.coalesce(func.sum(Payment.amount), 0))
        .join(Payment, Payment.booking_id == Booking.id, isouter=True)
        .filter(Payment.payment_status == "paid")
        .group_by(Booking.booking_date)
        .order_by(Booking.booking_date)
        .all()
    )
    return [{"date": str(d), "revenue": float(amt)} for d, amt in rows]


@router.get("/utilization")
def utilization(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(Room.name, func.count(Booking.id))
        .join(Booking, Booking.room_id == Room.id, isouter=True)
        .group_by(Room.name)
        .all()
    )
    return [{"room": name, "bookings": count} for name, count in rows]

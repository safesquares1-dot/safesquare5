"""Payments router: create intent, mark paid (stub)."""
from decimal import Decimal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import bad_request, not_found
from app.db import Booking, Payment, User, get_db
from app.deps import get_current_user
from app.schemas import PaymentOut

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/bookings/{booking_id}", response_model=PaymentOut, status_code=201)
def create_payment(
    booking_id: UUID,
    provider: str = "stripe",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentOut:
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise not_found("booking not found")
    p = Payment(
        booking_id=b.id,
        amount=Decimal(b.total_amount),
        currency="USD",
        payment_status="pending",
        provider=provider,
        transaction_id=f"txn_{uuid4().hex[:12]}",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return PaymentOut.model_validate(p)


@router.post("/{payment_id}/confirm", response_model=PaymentOut)
def confirm_payment(
    payment_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentOut:
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        raise not_found("payment not found")
    p.payment_status = "paid"
    p.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(p)
    return PaymentOut.model_validate(p)


from datetime import datetime  # noqa: E402

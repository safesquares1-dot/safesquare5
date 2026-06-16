"""Pydantic schemas (request/response)."""
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ===== Auth =====
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    phone: Optional[str] = None
    role: Literal["practitioner", "public"] = "public"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class RefreshIn(BaseModel):
    refresh_token: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# ===== User =====
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


# ===== Practitioner =====
class PractitionerIn(BaseModel):
    profession: str
    qualifications: str
    license_number: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    documents: list[Any] = []


class PractitionerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    profession: str
    qualifications: str
    license_number: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    verification_status: str
    created_at: datetime


# ===== Room =====
class RoomIn(BaseModel):
    name: str
    description: Optional[str] = None
    room_type: Literal["therapy", "consultation", "meeting"]
    capacity: int = Field(ge=1, le=50)
    hourly_rate: Decimal = Field(ge=0)
    amenities: list[str] = []
    images: list[str] = []
    status: Literal["active", "maintenance", "archived"] = "active"


class RoomOut(RoomIn):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    created_at: datetime


class RoomAvailabilityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    weekday: int
    open_time: str
    close_time: str


# ===== Booking =====
class BookingIn(BaseModel):
    room_id: UUID
    booking_date: date
    start_time: str  # HH:MM
    end_time: str
    notes: Optional[str] = None


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    room_id: UUID
    practitioner_id: UUID
    booking_date: date
    start_time: str
    end_time: str
    status: str
    notes: Optional[str] = None
    total_amount: Decimal
    created_at: datetime


class BookingUpdate(BaseModel):
    booking_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[Literal["pending", "confirmed", "cancelled", "completed", "no_show"]] = None
    notes: Optional[str] = None


# ===== Payment =====
class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    booking_id: UUID
    amount: Decimal
    currency: str
    payment_status: str
    transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None


# ===== Blog =====
class BlogCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None


class BlogIn(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    category_id: Optional[UUID] = None
    tags: list[str] = []
    published: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class BlogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    category_id: Optional[UUID] = None
    tags: list[str] = []
    author_id: Optional[UUID] = None
    published: bool
    published_at: Optional[datetime] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    created_at: datetime


# ===== Contact =====
class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


# ===== Analytics =====
class AnalyticsOut(BaseModel):
    total_practitioners: int
    active_bookings: int
    revenue: Decimal
    occupancy_rate: float
    growth_metrics: dict[str, Any]


TokenOut.model_rebuild()

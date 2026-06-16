"""Database session + base model. Lean: in-memory + SQLite fallback for local dev.

In production, point DATABASE_URL at Supabase Postgres. The schema is identical.
"""
from __future__ import annotations

import os
from datetime import datetime
from typing import Generator
from uuid import UUID, uuid4

from sqlalchemy import (
    Column, String, DateTime, Boolean, Integer, Numeric, Date, Time, ForeignKey, Text, JSON, create_engine
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from sqlalchemy.types import TypeDecorator, CHAR

from app.core.config import get_settings


class GUID(TypeDecorator):
    """Platform-independent UUID column."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, UUID):
            return str(value)
        return str(UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return UUID(value)


Base = declarative_base()


# ===== Models =====
class User(Base):
    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    avatar_url = Column(String)
    role = Column(String, default="public", nullable=False)  # admin | practitioner | public
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Practitioner(Base):
    __tablename__ = "practitioners"
    id = Column(GUID(), primary_key=True, default=uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    profession = Column(String, nullable=False)
    qualifications = Column(String, nullable=False)
    license_number = Column(String, nullable=False)
    bio = Column(Text)
    profile_image = Column(String)
    documents = Column(JSON, default=list)
    verification_status = Column(String, default="pending")  # pending | approved | rejected | suspended
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")


class Room(Base):
    __tablename__ = "rooms"
    id = Column(GUID(), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text)
    room_type = Column(String, nullable=False)
    capacity = Column(Integer, default=1, nullable=False)
    hourly_rate = Column(Numeric(10, 2), nullable=False)
    amenities = Column(JSON, default=list)
    images = Column(JSON, default=list)
    status = Column(String, default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RoomAvailability(Base):
    __tablename__ = "room_availability"
    id = Column(GUID(), primary_key=True, default=uuid4)
    room_id = Column(GUID(), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    weekday = Column(Integer, nullable=False)
    open_time = Column(String, nullable=False)   # "HH:MM"
    close_time = Column(String, nullable=False)


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(GUID(), primary_key=True, default=uuid4)
    room_id = Column(GUID(), ForeignKey("rooms.id"), nullable=False)
    practitioner_id = Column(GUID(), ForeignKey("practitioners.id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    status = Column(String, default="pending")
    notes = Column(Text)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Payment(Base):
    __tablename__ = "payments"
    id = Column(GUID(), primary_key=True, default=uuid4)
    booking_id = Column(GUID(), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    payment_status = Column(String, default="pending")
    transaction_id = Column(String)
    provider = Column(String)
    paid_at = Column(DateTime)


class BlogCategory(Base):
    __tablename__ = "blog_categories"
    id = Column(GUID(), primary_key=True, default=uuid4)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text)


class Blog(Base):
    __tablename__ = "blogs"
    id = Column(GUID(), primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    featured_image = Column(String)
    category_id = Column(GUID(), ForeignKey("blog_categories.id"))
    tags = Column(JSON, default=list)
    author_id = Column(GUID(), ForeignKey("users.id"))
    published = Column(Boolean, default=False)
    published_at = Column(DateTime)
    meta_title = Column(String)
    meta_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(GUID(), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    subject = Column(String)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ===== Engine / Session =====
_settings = get_settings()
_connect_args = {"check_same_thread": False} if _settings.database_url.startswith("sqlite") else {}
engine = create_engine(_settings.database_url, connect_args=_connect_args, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def init_db() -> None:
    """Create tables (dev convenience). Use Supabase migrations in prod."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

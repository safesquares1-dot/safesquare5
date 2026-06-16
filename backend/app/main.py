"""FastAPI application entrypoint."""
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db import init_db
from app.routers import analytics, auth, blogs, bookings, contact, payments, practitioners, rooms

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {
        "service": settings.app_name,
        "version": settings.api_version,
        "status": "ok",
        "time": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/health")
def health() -> dict:
    return {"status": "healthy"}


app.include_router(auth.router, prefix="/api")
app.include_router(practitioners.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(blogs.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.on_event("startup")
def _startup() -> None:
    init_db()

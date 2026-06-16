"""Security helpers: password hashing + JWT."""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _pwd.verify(plain, hashed)
    except Exception:
        return False


def create_access_token(subject: str, claims: dict[str, Any] | None = None) -> str:
    s = get_settings()
    payload: dict[str, Any] = {
        "sub": subject,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=s.access_token_ttl_min),
        "iat": datetime.now(timezone.utc),
    }
    if claims:
        payload.update(claims)
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_alg)


def create_refresh_token(subject: str) -> str:
    s = get_settings()
    payload = {
        "sub": subject,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=s.refresh_token_ttl_days),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_alg)


def decode_token(token: str) -> dict[str, Any]:
    s = get_settings()
    try:
        return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_alg])
    except JWTError as e:
        raise ValueError(f"invalid token: {e}") from e

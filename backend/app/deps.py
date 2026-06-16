"""Auth dependencies."""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.errors import forbidden, unauthorized
from app.core.security import decode_token
from app.db import User, get_db


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise unauthorized()
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except ValueError as e:
        raise unauthorized(str(e)) from e

    if payload.get("type") != "access":
        raise unauthorized("wrong token type")

    sub = payload.get("sub")
    if not sub:
        raise unauthorized()
    user = db.query(User).filter(User.id == UUID(sub)).first()
    if not user:
        raise unauthorized("user not found")
    return user


def require_role(*roles: str):
    def dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise forbidden(f"requires role in {roles}")
        return user
    return dep


require_admin = require_role("admin")
require_practitioner = require_role("practitioner", "admin")

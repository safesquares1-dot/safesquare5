"""Auth router: register, login, refresh, password reset, me."""
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import bad_request, unauthorized
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.db import User, get_db
from app.deps import get_current_user
from app.schemas import (
    ForgotPasswordIn,
    LoginIn,
    RefreshIn,
    RegisterIn,
    ResetPasswordIn,
    TokenOut,
    UserOut,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens_for(user: User) -> TokenOut:
    access = create_access_token(str(user.id), claims={"role": user.role, "email": user.email})
    refresh = create_refresh_token(str(user.id))
    return TokenOut(access_token=access, refresh_token=refresh, user=UserOut.model_validate(user))


@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    if db.query(User).filter(User.email == payload.email).first():
        raise bad_request("email already registered")
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _tokens_for(user)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise unauthorized("invalid credentials")
    return _tokens_for(user)


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)) -> TokenOut:
    try:
        data = decode_token(payload.refresh_token)
    except ValueError as e:
        raise unauthorized(str(e)) from e
    if data.get("type") != "refresh":
        raise unauthorized("not a refresh token")
    user = db.query(User).filter(User.id == UUID(data["sub"])).first()
    if not user:
        raise unauthorized("user not found")
    return _tokens_for(user)


@router.post("/logout", status_code=204)
def logout() -> None:
    # JWTs are stateless. In production, maintain a denylist in Redis.
    return None


@router.post("/forgot-password", status_code=202)
def forgot_password(payload: ForgotPasswordIn) -> dict:
    # In production: send a reset link via email (Supabase Auth handles this).
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=200)
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)) -> dict:
    try:
        data = decode_token(payload.token)
    except ValueError as e:
        raise unauthorized(str(e)) from e
    user = db.query(User).filter(User.id == UUID(data["sub"])).first()
    if not user:
        raise unauthorized("user not found")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "password updated"}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)

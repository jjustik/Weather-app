import jwt
import hashlib
from typing import Annotated
from uuid import UUID
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from fastapi import Cookie
from jwt.exceptions import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends, HTTPException
from pwdlib import PasswordHash
from email_validator import validate_email

from app.models.user import User as UserModel
from app.db import get_async_session
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
password_hash = PasswordHash.recommended()
dummy_hash = password_hash.hash("dummypassword")

def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)

def hash_password(password: str):
    return password_hash.hash(password)

async def authenticate_user(email: str, password: str, session: AsyncSession):
    result = await session.execute(
        select(UserModel).where(
            (UserModel.email == email) | (UserModel.name == email)
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        verify_password(password, dummy_hash)
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


async def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
    session: Annotated[AsyncSession, Depends(get_async_session)] = None
    ):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    if access_token is None:
        raise credentials_exception

    try:
        payload = jwt.decode(
            access_token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )

        user_id_str = payload.get("sub")

        if user_id_str is None:
            raise credentials_exception

        user_id = UUID(user_id_str)

    except (InvalidTokenError, ValueError):
        raise credentials_exception

    result = await session.execute(
        select(UserModel)
        .where(UserModel.id == user_id)
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user

def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})

    encoded_jwt = jwt.encode(to_encode, settings.refresh_secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:

        return None
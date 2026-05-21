import jwt
import os
from typing import Annotated
from uuid import UUID
from datetime import datetime, timedelta, timezone
import uuid as uuid_module
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends, HTTPException, status
from pwdlib import PasswordHash
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError

from app.models import User as UserModel
from app.schemas import UserCreate, User
from app.db import get_async_session


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
password_hash = PasswordHash.recommended()
dummy_hash = password_hash.hash("dummypassword")

def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)

def hash_password(password: str):
    return password_hash.hash(password)

async def authenticate_user(name: str, password: str, session: AsyncSession):
    result = await session.execute(
        select(UserModel).where(
            (UserModel.email == name) | (UserModel.name == name)
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
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")

        if user_id_str is None:
            raise credentials_exception
        
        user_id = uuid_module.UUID(user_id_str)

    except (InvalidTokenError, ValueError):
        raise credentials_exception

    result = await session.execute(
        select(UserModel).where(UserModel.id == user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception

    return user

def is_email(value: str) -> bool:
    try:
        validate_email(value)
        return True
    except EmailNotValidError:
        return False
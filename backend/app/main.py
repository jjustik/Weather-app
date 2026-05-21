import time
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from uuid import uuid4
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware

from app.db import create_db_and_tables, get_async_session
from app.auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, hash_password, get_current_user, is_email
from app.models import User as UserModel
from app.schemas import UserCreate, User, Token, CityUpdate

MEDIA_DIR = Path("media")
AVATARS_DIR = MEDIA_DIR / "avatars"
DEFAULT_AVATAR_URL = "/media/default-avatar.jpg"

MEDIA_DIR.mkdir(parents=True, exist_ok=True)
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/registration")
async def register_user(
    user: UserCreate,
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    login_value = user.login.strip().lower()

    existing_user_query = select(UserModel).where(
        (UserModel.email == login_value) | (UserModel.name == login_value)
    )

    existing_user_result = await session.execute(existing_user_query)
    existing_user = existing_user_result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email or nickname already exists"
        )

    if is_email(login_value):
        new_user = UserModel(
            email=login_value,
            name=None,
            password_hash=hash_password(user.password),
            avatar_url=DEFAULT_AVATAR_URL,
        )
    else:
        new_user = UserModel(
            email=None,
            name=login_value,
            password_hash=hash_password(user.password),
            avatar_url=DEFAULT_AVATAR_URL,
        )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(new_user.id)}, expires_delta=access_token_expires)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "avatar_url": new_user.avatar_url or DEFAULT_AVATAR_URL,
        }
    }


@app.post("/token")
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: Annotated[AsyncSession, Depends(get_async_session)]):
    user = await authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(status_code=401, 
                            detail="Incorrect email or password",
                            headers={"WWW-Authenticate": "Bearer"},)
    access_token = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token)
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me")
async def read_me(current_user: Annotated[UserModel, Depends(get_current_user)]):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url or DEFAULT_AVATAR_URL,
        "cities": current_user.cities or [],
    }

@app.post("/users/me/avatar")
async def upload_avatar(
    avatar: Annotated[UploadFile, File()],
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    extension = allowed_types.get(avatar.content_type)

    if extension is None:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed",
        )

    contents = await avatar.read()

    max_size = 2 * 1024 * 1024

    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Avatar is too large. Max size is 2 MB",
        )

    filename = f"{current_user.id}_{uuid4().hex}{extension}"
    file_path = AVATARS_DIR / filename

    file_path.write_bytes(contents)

    current_user.avatar_url = f"/media/avatars/{filename}"

    await session.commit()
    await session.refresh(current_user)

    return {
        "avatar_url": current_user.avatar_url,
    }


@app.post("/users/me/city")
async def update_city(
    data: CityUpdate,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    await session.execute(
        update(UserModel)
        .where(UserModel.id == current_user.id)
        .values(cities=data.cities)
    )

    await session.commit()

    return {
        "cities": data.cities
    }
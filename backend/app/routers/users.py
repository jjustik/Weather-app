from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pathlib import Path
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from typing import Annotated

from app.db import get_async_session
from app.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.city import CityUpdate

MEDIA_DIR = Path("")
AVATARS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "frontend" / "avatars" / "users"

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def read_me(current_user: Annotated[UserModel, Depends(get_current_user)]):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url or None,
        "cities": current_user.cities or [],
        "add_button": current_user.add_button
    }


@router.post("/me/avatar")
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

    AVATARS_DIR.mkdir(parents=True, exist_ok=True)

    file_path.write_bytes(contents)

    current_user.avatar_url = f"/avatars/users/{filename}"

    await session.commit()
    await session.refresh(current_user)

    return {
        "avatar_url": current_user.avatar_url,
    }


@router.post("/me/city")
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


@router.put("/me")
async def update_user(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    current_user.add_button = not current_user.add_button
    
    await session.commit()
    await session.refresh(current_user)

    return {"add_button": current_user.add_button}
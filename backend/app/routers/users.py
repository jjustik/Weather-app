import aiohttp

from fastapi import APIRouter, Depends, UploadFile, File
from loguru import logger
from pathlib import Path
from pydantic import EmailStr
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, select
from typing import Annotated, Optional
from urllib.parse import urlparse

from app.config import settings
from app.db import get_async_session
from app.exceptions import(
    ImageTooLargeException, 
    InvalidImageExtensionException, 
    UserAlreadyExistsException,
    AvatarUploadFailedException
    )
from app.utils.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.city import CityUpdate
from app.utils.avatars import upload_file_to_r2, delete_file_from_r2

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
        logger.warning(f"User {current_user.id} tried to upload an invalid avatar type: {avatar.content_type}")
        raise InvalidImageExtensionException()

    contents = await avatar.read()
    max_size = 10 * 1024 * 1024

    if len(contents) > max_size:
        logger.warning(f"User {current_user.id} tried to upload an avatar that is too large: {len(contents)} bytes")
        raise ImageTooLargeException()

    filename = f"avatars/{current_user.id}_{uuid4().hex}{extension}"
    avatar_url = await upload_file_to_r2(
        file_bytes=contents,
        filename=filename,
        content_type=avatar.content_type
    )

    current_user.avatar_url = avatar_url

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


@router.put("/me/add_button")
async def update_add_button(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    current_user.add_button = not current_user.add_button
    
    await session.commit()
    await session.refresh(current_user)

    return {"add_button": current_user.add_button}


@router.put("/me/name")
async def update_user_name(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
    name: Optional[str] = None
):

    result = await session.execute(select(UserModel).where(UserModel.name == name))
    user = result.scalar_one_or_none()

    if user:
        logger.warning(f"User {current_user.id} tried to update their name to an already existing name: {name}")
        raise UserAlreadyExistsException(name)

    current_user.name = name

    await session.commit()
    await session.refresh(current_user)

    return {"name": current_user.name}


@router.delete("/me/avatar")
async def delete_avatar(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):

    if current_user.avatar_url:
        parsed_url = urlparse(current_user.avatar_url)
        object_key = parsed_url.path.lstrip("/")

        try:
            await delete_file_from_r2(object_key)
        except Exception as e:
            logger.error(f"Failed to delete avatar from R2 for user {current_user.id}: {e}")
            raise AvatarUploadFailedException(reason=str(e))

    current_user.avatar_url = None

    await session.commit()
    await session.refresh(current_user)

    return {
        "avatar_url": current_user.avatar_url
    }


@router.get("/validate-real-email")
async def validate_real_email(email: EmailStr) -> dict:
    url = "https://emailreputation.abstractapi.com/v1/"
    params = {
        "api_key": settings.validation_api_key,
        "email": email
    }
    
    print(f"\n[DEBUG] KEY IN USE: '{settings.validation_api_key}'\n")
    timeout = aiohttp.ClientTimeout(total=3.0)

    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"Abstract API returned status {response.status} for email '{email}'")
                    return {"email": email, "is_exist": None, "reason": "API error or limit reached"}
                
                data = await response.json()
                deliverability_data = data.get("email_deliverability", {})
                status = deliverability_data.get("status")

                if status == "deliverable":
                    is_exist = True
                elif status == "undeliverable":
                    is_exist = False
                else:
                    is_exist = None

                return {"email": email, "is_exist": is_exist}
    except aiohttp.ClientError as e:
        logger.error(f"Error occurred while validating email '{email}': {str(e)}")
        return {"email": email, "is_exist": None, "reason": "Service unavailable"}


@router.get("/email-exists")
async def check_user_exists(
    email: EmailStr, 
    session: Annotated[AsyncSession, Depends(get_async_session)]
) -> dict:
    result = await session.execute(select(UserModel).where(UserModel.email == email))
    user = result.scalar_one_or_none()

    if user:
        return {"exists": True}
    else:
        return {"exists": False}


@router.get("/username-exists")
async def check_username_exists(
    name: str,
    session: Annotated[AsyncSession, Depends(get_async_session)]
) -> dict:
    result = await session.execute(select(UserModel).where(UserModel.name == name))
    user = result.scalar_one_or_none()

    if user:
        return {"exists": True}
    else:
        return {"exists": False}
import uuid
from datetime import timedelta
from typing import Annotated
import jwt
from jwt.exceptions import InvalidTokenError

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_async_session
from app.redis import get_redis
from app.models.user import User as UserModel
from app.config import settings
from app.auth import (
    hash_password, 
    authenticate_user, 
    create_access_token, 
    is_email,
    create_refresh_token,
    token_hash
)
from app.schemas.users import (
    ForgotPasswordRequest, 
    ResetPasswordRequest, 
    UserCreate,
    StatusResponse
)
from app.utils.email import send_reset_email 

DEFAULT_AVATAR_URL = "/media/default-avatar.jpg"

router = APIRouter(tags=["Auth"])


@router.post("/registration")
async def register_user(
    request: Request,  # 👈 Добавили request сюда
    response: Response,
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

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(data={"sub": str(new_user.id)}, expires_delta=access_token_expires)

    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    new_user.refresh_token_hash = token_hash(refresh_token)
    await session.commit()

    is_production = "localhost" not in str(request.base_url)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/"
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,  # Изменили тут
        samesite="none" if is_production else "lax",  # Изменили тут
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/auth/refresh"
    )

    return {
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "avatar_url": new_user.avatar_url or DEFAULT_AVATAR_URL,
        }
    }


@router.post("/login")
async def login_user(
    request: Request, 
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    user = await authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    user.refresh_token_hash = token_hash(refresh_token)
    await session.commit()

    is_production = "localhost" not in str(request.base_url)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/"
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,   # Изменили тут
        samesite="none" if is_production else "lax",  # Изменили тут
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/auth/refresh"
    )
    
    return {"Message": "Logged in"}


    is_production = "localhost" not in str(request.base_url)

    response.set_cookie(
        key="access_token", 
        value=new_access_token, 
        httponly=True, 
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=settings.access_token_expire_minutes * 60, 
        path="/"
    )
    response.set_cookie(
        key="refresh_token", 
        value=new_refresh_token, 
        httponly=True, 
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60, 
        path="/auth/refresh"
    )
    
    return StatusResponse(status="success", message="Tokens successfully refreshed")
from datetime import timedelta
import secrets
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.redis import get_redis
from app.config import settings
from app.db import get_async_session
from app.models.user import User as UserModel
from app.config import settings
from app.auth import (
    hash_password, 
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    token_hash
)
from app.schemas.users import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserCreate,
)
from app.utils.email import send_reset_email 

DEFAULT_AVATAR_URL = "/media/default-avatar.jpg"

router = APIRouter(tags=["Auth"])


@router.post("/registration")
async def register_user(
    request: Request,
    response: Response,
    user: UserCreate,
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    email_value = user.user_email.strip().lower()

    existing_user_query = select(UserModel).where((UserModel.email == email_value))

    existing_user_result = await session.execute(existing_user_query)
    existing_user = existing_user_result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    else:
        new_user = UserModel(
            email=email_value,
            name=None,
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
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/auth/refresh"
    )
    
    return {"Message": "Logged in"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session),
    redis = Depends(get_redis)
):
    query = select(UserModel).where(UserModel.email == data.email.lower().strip())
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
        
    reset_token = secrets.token_urlsafe(32)
    
    await redis.setex(f"reset:{reset_token}", 900, str(user.id))
    
    frontend_url = "https://justik-weather.vercel.app/reset-password.html"
    reset_link = f"{frontend_url}?token={reset_token}"
    
    background_tasks.add_task(send_reset_email, user.email, reset_link)
    
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    data: ResetPasswordRequest,
    session: AsyncSession = Depends(get_async_session),
    redis = Depends(get_redis)
):
    
    token_key = f"reset:{data.token}"
    user_id = await redis.get(token_key)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired or is invalid."
        )
        
    query = select(UserModel).where(UserModel.id == user_id)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    user.password_hash = hash_password(data.new_password)
    
    user.refresh_token_hash = None 
    
    await session.commit()
    
    await redis.delete(token_key)
    
    return {"message": "Password successfully reset."}
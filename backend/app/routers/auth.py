from datetime import timedelta
import secrets
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.redis import get_redis
from app.logger import logger
from app.config import settings
from app.db import get_async_session
from app.models.user import User as UserModel
from app.exceptions import (
    InvalidCredentialsException, 
    UserAlreadyExistsException, 
    UserNotFoundException,
    InvalidRefreshTokenException,
    RefreshTokenNotProvidedException,
    PasswordResetTokenInvalidException
    )
from app.utils.auth import (
    get_current_user,
    hash_password, 
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    token_hash,
    verify_token,
    set_access_token_cookie,
    set_refresh_token_cookie
)
from app.schemas.users import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserCreate,
)
from app.utils.email import send_reset_email 

DEFAULT_AVATAR_URL = "/media/default-avatar.jpg"

router = APIRouter(tags=["Auth"])


def check_is_production(request: Request) -> bool:
    base_url = str(request.base_url)
    return "localhost" not in base_url and "127.0.0.1" not in base_url


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
        logger.warning(f"User with email {email_value} already exists during registration")
        raise UserAlreadyExistsException(email_value)
    
    new_user = UserModel(
        email=email_value,
        name=None,
        password_hash=hash_password(user.password),
        avatar_url=None,
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(data={"sub": str(new_user.id)}, expires_delta=access_token_expires)

    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    new_user.refresh_token_hash = token_hash(refresh_token)
    await session.commit()

    is_production = check_is_production(request)

    await set_access_token_cookie(response, access_token, is_production)
    await set_refresh_token_cookie(response, refresh_token, is_production)

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
        logger.warning(f"Incorrect email or password")
        raise InvalidCredentialsException()
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    user.refresh_token_hash = token_hash(refresh_token)
    await session.commit()

    is_production = check_is_production(request)

    await set_access_token_cookie(response, access_token, is_production)
    await set_refresh_token_cookie(response, refresh_token, is_production)
    
    return {"Message": "Logged in"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    session: Annotated[AsyncSession, Depends(get_async_session)],
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
    session: Annotated[AsyncSession, Depends(get_async_session)],
    redis = Depends(get_redis)
):
    token_key = f"reset:{data.token}"
    user_id = await redis.get(token_key)
    
    if not user_id:
        logger.warning(f"Invalid or expired password reset token used: {data.token}")
        raise PasswordResetTokenInvalidException(token=data.token)
        
    query = select(UserModel).where(UserModel.id == user_id)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        logger.error(f"User with ID {user_id} not found during password reset")
        raise UserNotFoundException(user_id)
    user.password_hash = hash_password(data.new_password)
    user.refresh_token_hash = None 
    
    await session.commit()
    await redis.delete(token_key)
    
    return {"message": "Password successfully reset."}


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh_token(
    request: Request,
    response: Response,
    session: Annotated[AsyncSession, Depends(get_async_session)],
    refresh_token: Annotated[str | None, Cookie()] = None
):
    if not refresh_token:
        logger.warning("Refresh token not provided in cookie")
        raise RefreshTokenNotProvidedException()
    
    payload = verify_token(refresh_token, secret_key=settings.refresh_secret_key)
    if not payload:
        logger.warning("Invalid refresh token provided")
        raise InvalidRefreshTokenException()
        
    user_id_str = payload.get("sub")

    result = await session.execute(select(UserModel).where(UserModel.id == user_id_str))
    user = result.scalar_one_or_none()

    if not user or user.refresh_token_hash != token_hash(refresh_token):
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")
        logger.warning(f"Invalid refresh token for user ID {user_id_str}")
        raise InvalidRefreshTokenException(user_id=user_id_str)
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    new_access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    user.refresh_token_hash = token_hash(new_refresh_token)
    await session.commit()

    is_production = check_is_production(request)

    await set_access_token_cookie(response, new_access_token, is_production)
    await set_refresh_token_cookie(response, new_refresh_token, is_production)

    return {"message": "Tokens refreshed successfully."}


@router.put("/logout", status_code=status.HTTP_200_OK)
async def logout_user(
    request: Request,
    response: Response,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    current_user.refresh_token_hash = None
    await session.commit()

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return {"message": "Logged out successfully."}
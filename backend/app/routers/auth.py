import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session
from app.redis import get_redis
from app.models.models import User as UserModel
from app.auth import hash_password
from app.schemas.users import ForgotPasswordRequest, ResetPasswordRequest
from app.utils.email import send_reset_email 

router = APIRouter(tags=["Auth"])


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session),
    redis_cl=Depends(get_redis)
):
    query = select(UserModel).where(UserModel.email == data.email.lower().strip())
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
    
    token = str(uuid.uuid4())
    redis_key = f"pwd_reset:{token}"
    await redis_cl.set(redis_key, str(user.id), ex=900)
    
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    # ВОТ ЗДЕСЬ МАГИЯ: Закидываем отправку в фон
    background_tasks.add_task(send_reset_email, user.email, reset_link)
    
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    session: AsyncSession = Depends(get_async_session),
    redis_cl=Depends(get_redis)
):
    redis_key = f"pwd_reset:{data.token}"
    
    user_id = await redis_cl.get(redis_key)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has expired or is invalid"
        )
    
    if isinstance(user_id, bytes):
        user_id = user_id.decode('utf-8')
    
    query = select(UserModel).where(UserModel.id == uuid.UUID(user_id))
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = hash_password(data.new_password)
    await session.commit()
    
    await redis_cl.delete(redis_key)
    
    return {"message": "Password updated successfully"}
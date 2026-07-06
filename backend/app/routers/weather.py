from fastapi import APIRouter, Depends, HTTPException
import redis
import httpx
from typing import Annotated

from app.config import settings
from app.redis import get_redis
from app.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.city import CacheCities

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/api/get-weather")
async def get_weather(city: str):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.api_key}&units=metric"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching weather data")
        return response.json()


@router.post("/cache")
async def cache_weather(
    data: CacheCities,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    redis_cl: Annotated[redis.Redis, Depends(get_redis)]
):
    cache_key = f"weather:user:{current_user.id}"

    await redis_cl.hset(name=cache_key, mapping={
        "weather": data.weather,
        "hourly_weather": data.hourly_weather,
        "daily_weather": data.daily_weather
    })
    await redis_cl.expire(name=cache_key, time=settings.weather_cache_expire)
    return {"message": "Weather data cached successfully"}


@router.get("/cache", response_model=CacheCities)
async def get_cached_weather(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    redis_cl: Annotated[redis.Redis, Depends(get_redis)]
):
    cache_key = f"weather:user:{current_user.id}"
    cached_data = await redis_cl.hgetall(cache_key)

    if not cached_data:
        raise HTTPException(status_code=404, detail="No cached weather data found")
    
    return cached_data
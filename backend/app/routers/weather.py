import json
import pycountry

from fastapi import APIRouter, Depends, HTTPException
import redis
import aiohttp
from typing import Annotated

from app.config import settings
from app.redis import get_redis
from app.exceptions import ExternalAPIError
from app.utils.auth import get_current_user, get_optional_user
from app.models.user import User as UserModel
from app.logger import logger
from app.utils.weather_utils import clean_text, get_country_code, fix_encoding

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/api/get-weather")
async def get_weather(
    city: str,
    current_user: Annotated[UserModel, Depends(get_optional_user)],
    redis_cl: Annotated[redis.Redis, Depends(get_redis)]
):
    city_key = city.lower().strip()

    if current_user:
        cache_key = f"weather:user:{current_user.id}"
    else:
        cache_key = f"weather:guest"

    cached_weather = await redis_cl.hget(name=cache_key, key=city_key)

    if cached_weather:
        return json.loads(cached_weather)


    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.api_key}&units=metric"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                logger.error(f"Failed to fetch weather data for city '{city}': {response.status}")
                raise ExternalAPIError(api_name="OpenWeatherMap", status_code=response.status, message=await response.text())
            
            weather_data = await response.json()

    await redis_cl.hset(
        name=cache_key, 
        key=city_key, 
        value=json.dumps(weather_data))
    
    await redis_cl.expire(
        name=cache_key, 
        time=settings.weather_cache_expire)
    
    return weather_data


@router.get("/cache")
async def get_cached_weather(
    current_user: Annotated[UserModel, Depends(get_optional_user)],
    redis_cl: Annotated[redis.Redis, Depends(get_redis)]
):
    if current_user:
        cache_key = f"weather:user:{current_user.id}"
    else:
        cache_key = f"weather:guest"
    cached_data = await redis_cl.hgetall(cache_key)

    if not cached_data:
        logger.warning(f"No cached weather data found for {'user ' + str(current_user.id) if current_user else 'guest'}")
        raise ExternalAPIError(api_name="Redis", status_code=404, message="No cached weather data found")
    
    for city, info in cached_data.items():
        cached_data[city] = json.loads(info)

    return cached_data


@router.get("/api/search")
async def search_city(q: str):
    key = settings.SearchAPIKey
    url = f"https://api.weatherapi.com/v1/search.json?key={key}&q={q}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                return []
            cities = await response.json()

    for city in cities:
        city.pop('url', None)
        city["name"] = clean_text(city.get("name"))
        city["region"] = clean_text(city.get("region"))
        city["country"] = clean_text(city.get("country"))

        code = get_country_code(city.get("country"))
        city["country_code"] = code
        city["flag"] = f"https://flagcdn.com/w40/{code}.png" if code else None

    return cities
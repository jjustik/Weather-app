from redis import Redis
import redis.asyncio as aioredis
from dotenv import load_dotenv
import os

load_dotenv()
REDIS_URL = os.getenv("REDIS_URL")

redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)

async def get_redis():
    return redis_client
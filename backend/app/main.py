from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from app.db import create_db_and_tables
from app.routers import auth, users, weather 

MEDIA_DIR = Path("media")

@asynccontextmanager
async def lifespan(app: FastAPI):
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    (MEDIA_DIR / "avatars").mkdir(parents=True, exist_ok=True)
    
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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(weather.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Weather App API"}
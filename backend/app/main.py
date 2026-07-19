from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from app.db import create_db_and_tables
from app.routers import auth, users, weather 

FRONTEND_AVATARS_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "avatars" / "users"
FRONTEND_AVATARS_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.mount("/avatars/users", StaticFiles(directory=str(FRONTEND_AVATARS_DIR)), name="user_avatars")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://justik-weather.vercel.app",
        "http://localhost:3000",
    ],
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
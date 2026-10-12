from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from pathlib import Path

from app.db import create_db_and_tables
from app.routers import auth, users, weather, payment
from app.logger import setup_logger, logger
from app.exceptions import AppException

FRONTEND_AVATARS_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "avatars" / "users"
FRONTEND_AVATARS_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

setup_logger()

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
app.include_router(payment.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Weather App API"}


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.warning(
        f"Handled Exception: {exc.__class__.__name__} | "
        f"Status: {exc.status_code} | "
        f"Detail: {exc.detail} | "
        f"Path: {request.url.path}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

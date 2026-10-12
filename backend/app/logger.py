import sys
from pathlib import Path
from loguru import logger

BASE_DIR = Path(__file__).resolve().parent.parent.parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

def setup_logger():
    logger.remove()

    logger.add(
        sys.stdout,
        level="INFO",
        enqueue=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level:5}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    )

    logger.add(
        LOGS_DIR / "app.log",
        level="WARNING",
        enqueue=True,
        rotation="10 MB",
        retention="7 days",
        compression="zip",
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )

    logger.add(
        LOGS_DIR / "errors.log",
        level="ERROR",
        rotation="5 MB",
        enqueue=True,
        retention="14 days",
        compression="zip",
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )

    return logger
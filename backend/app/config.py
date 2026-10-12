import os
from pydantic_settings import BaseSettings, SettingsConfigDict

current_dir = os.path.dirname(os.path.abspath(__file__))

env_path = os.path.join(current_dir, "..", "..", ".env")

class Settings(BaseSettings):
    secret_key: str
    refresh_secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    database_url: str
    redis_url: str
    weather_cache_expire: int
    api_key: str
    SearchAPIKey: str
    validation_api_key: str
    r2_account_id: str
    r2_access_key: str
    r2_secret_key: str
    r2_bucket_name: str
    r2_public_custom_domain: str
    r2_endpoint_url: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_price_coins_1000: str
    stripe_price_coins_5000: str
    stripe_price_coins_10000: str


    model_config = SettingsConfigDict(env_file=env_path, env_file_encoding="utf-8", extra="ignore")

settings = Settings()
from uuid import UUID
from pydantic import EmailStr, BaseModel, Field
from typing import List

class User(BaseModel):
    login: str

class UserCreate(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CityUpdate(BaseModel):
    cities: list[str] = Field(default_factory=list)


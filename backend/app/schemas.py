from uuid import UUID
from pydantic import EmailStr, BaseModel

class User(BaseModel):
    login: str

class UserCreate(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
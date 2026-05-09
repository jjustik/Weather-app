from uuid import UUID
from pydantic import EmailStr, BaseModel

class User(BaseModel):
    name: str
    email: EmailStr

class UserCreate(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
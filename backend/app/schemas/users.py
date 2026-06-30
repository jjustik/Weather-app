from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    login: str

class UserCreate(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
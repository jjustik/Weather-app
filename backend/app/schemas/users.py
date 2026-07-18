from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    user_email: EmailStr

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

class StatusResponse(BaseModel):
    status: str
    message: str | None = None
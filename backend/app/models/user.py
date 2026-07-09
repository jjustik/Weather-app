import uuid
from app.db import Base
from sqlalchemy import String, Uuid
from sqlalchemy.dialects.postgresql import JSONB 
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    refresh_token_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    cities: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    add_button: Mapped[bool] = mapped_column(default=True)

    def __repr__(self):
        return f"User(id={self.id}, email={self.email})"
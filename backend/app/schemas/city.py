from pydantic import BaseModel, Field

class CityUpdate(BaseModel):
    cities: list[str] = Field(default_factory=list)
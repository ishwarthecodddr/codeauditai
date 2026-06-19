import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    model_name: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

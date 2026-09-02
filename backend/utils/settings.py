import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
load_dotenv()

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB_CONNECTION: str = os.environ.get("DB_CONNECTION", "sqlite:///./app.db")
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "default_secret_key_change_me_in_prod")
    ALGORITHM: str = os.environ.get("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_file_encoding="utf-8")

try:
    settings = Settings()
except Exception as e:
    print(f"Settings loading fallback: {e}")
    settings = Settings(
        DB_CONNECTION=os.environ.get("DB_CONNECTION", "sqlite:///./app.db"),
        SECRET_KEY=os.environ.get("SECRET_KEY", "default_secret_key_change_me_in_prod"),
    )

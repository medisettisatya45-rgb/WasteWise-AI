import os
from pathlib import Path
from typing import List

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key not in os.environ:
                    os.environ[key] = val


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "WasteWise AI")
    TAGLINE: str = "Identify. Recycle. Sustain."
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "wastewise-secure-jwt-secret-key-32chars-minimum-prod")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'wastewise.db'}")

    # CORS
    _cors_raw: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    CORS_ORIGINS: List[str] = [x.strip() for x in _cors_raw.split(",") if x.strip()]

    # Uploads & AI
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    AI_CONFIDENCE_THRESHOLD: float = float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.60"))

    # Initial Admin Seed
    DEFAULT_ADMIN_EMAIL: str = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@wastewise.ai")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "AdminPassword123!")
    DEFAULT_ADMIN_NAME: str = os.getenv("DEFAULT_ADMIN_NAME", "System Administrator")


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

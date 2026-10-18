from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
import jwt
from app.config import settings

MAX_PASSWORD_BYTES = 72
MIN_PASSWORD_LENGTH = 8


def validate_password_rules(password: str) -> None:
    """
    Validates password strength and strict UTF-8 byte limit for bcrypt.
    Bcrypt only processes up to 72 bytes. We strictly enforce this limit
    to prevent silent truncation and security pitfalls.
    """
    if not isinstance(password, str):
        raise ValueError("Password must be a string")
    
    if not password or not password.strip():
        raise ValueError("Password cannot be empty or contain only whitespace")
    
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
    
    utf8_bytes = password.encode("utf-8")
    if len(utf8_bytes) > MAX_PASSWORD_BYTES:
        raise ValueError(
            f"Password exceeds maximum supported limit of {MAX_PASSWORD_BYTES} UTF-8 bytes "
            f"(provided password is {len(utf8_bytes)} bytes). "
            f"Please choose a shorter password."
        )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a bcrypt hash.
    Safely rejects inputs exceeding the 72-byte bcrypt limit.
    """
    if not plain_password or not hashed_password:
        return False
    
    plain_bytes = plain_password.encode("utf-8")
    if len(plain_bytes) > MAX_PASSWORD_BYTES:
        return False
    
    try:
        return bcrypt.checkpw(plain_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Hashes a password with bcrypt after validating the 72-byte UTF-8 limit.
    """
    validate_password_rules(password)
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a secure JSON Web Token (JWT).
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "iss": "wastewise-ai"
    }
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT token.
    """
    try:
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            issuer="wastewise-ai"
        )
        return decoded
    except (jwt.PyJWTError, Exception):
        return None

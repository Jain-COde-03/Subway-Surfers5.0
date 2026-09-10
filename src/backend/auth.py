"""
auth.py — JWT-based httpOnly cookie authentication for S.A.M.A.Y

All user credentials are hardcoded here (mirrors LoginPage ROLES_CONFIG).
In a real production system you would store hashed passwords in the DB.
"""

import os
import datetime
from typing import Optional
from fastapi import Request, HTTPException, status

from jose import JWTError, jwt

# ── Secret key ────────────────────────────────────────────────────────────────
# Read from env in production (set in .env / docker-compose).
# A safe default is provided ONLY for local dev — override it in production!
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-use-a-32-byte-random-hex")
ALGORITHM = "HS256"
COOKIE_NAME = "samay_session"

# ── User database (mirrors frontend ROLES_CONFIG) ─────────────────────────────
USERS_DB = {
    "admin_control": {
        "id": "admin",
        "username": "admin_control",
        "password": "ir_password_2026",
        "name": "Shri Vikramaditya Sen",
        "designation": "Chief Corridor Controller & Joint Director (Planning)",
        "department": "Central Control & Operations",
        "deptShort": "Admin / Control",
    },
    "tms_engineer": {
        "id": "tms",
        "username": "tms_engineer",
        "password": "ir_password_2026",
        "name": "Er. Rajesh Kumar Sharma",
        "designation": "Sr. Divisional Engineer (Track / P-Way)",
        "department": "Track Management System (TMS)",
        "deptShort": "TMS (P-Way)",
    },
    "smms_dste": {
        "id": "smms",
        "username": "smms_dste",
        "password": "ir_password_2026",
        "name": "Dr. Ananya Mukherjee",
        "designation": "Sr. Div. Signal & Telecom Engineer (S&T)",
        "department": "Signaling Maintenance Management System",
        "deptShort": "SMMS (S&T)",
    },
    "tdms_dee": {
        "id": "tdms",
        "username": "tdms_dee",
        "password": "ir_password_2026",
        "name": "Er. Gurpreet Singh",
        "designation": "Sr. Divisional Electrical Engineer (TRD)",
        "department": "Traction Distribution Management System",
        "deptShort": "TDMS (TRD)",
    },
}


# ── Token helpers ─────────────────────────────────────────────────────────────

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Return user dict if credentials match, else None."""
    user = USERS_DB.get(username)
    if user and user["password"] == password:
        # Return a safe copy without the password
        return {k: v for k, v in user.items() if k != "password"}
    return None


def create_access_token(data: dict, expires_delta: datetime.timedelta) -> str:
    """Sign a JWT containing `data` that expires after `expires_delta`."""
    payload = data.copy()
    payload["exp"] = datetime.datetime.utcnow() + expires_delta
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises HTTPException 401 on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
        )


# ── FastAPI dependency ────────────────────────────────────────────────────────

def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency. Reads the httpOnly session cookie and returns the
    decoded user payload. Use as: `user = Depends(get_current_user)`.
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
        )
    return decode_token(token)


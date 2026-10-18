import pytest
from app.core.security import (
    validate_password_rules, verify_password, get_password_hash,
    MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH
)


class TestPasswordAuthentication:
    """
    Test suite for password authentication, validation, hashing,
    and bcrypt UTF-8 byte boundary enforcement.
    """

    def test_valid_password(self):
        """Test valid password passes validation and hashing."""
        pwd = "StrongPassword123!"
        validate_password_rules(pwd)
        hashed = get_password_hash(pwd)
        assert hashed is not None
        assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
        assert verify_password(pwd, hashed) is True

    def test_invalid_password_empty_and_whitespace(self):
        """Test empty and whitespace-only passwords are rejected."""
        with pytest.raises(ValueError, match="empty or contain only whitespace"):
            validate_password_rules("")
        
        with pytest.raises(ValueError, match="empty or contain only whitespace"):
            validate_password_rules("        ")

    def test_short_password(self):
        """Test passwords shorter than MIN_PASSWORD_LENGTH (8) are rejected."""
        with pytest.raises(ValueError, match=f"at least {MIN_PASSWORD_LENGTH} characters"):
            validate_password_rules("short")
        
        with pytest.raises(ValueError, match=f"at least {MIN_PASSWORD_LENGTH} characters"):
            validate_password_rules("1234567")

    def test_maximum_supported_password(self):
        """
        Test a password that is EXACTLY 72 UTF-8 bytes (Bcrypt's maximum supported input limit).
        Must be accepted, hashed properly, and verified successfully without truncation.
        """
        max_pwd = "A" * 72
        assert len(max_pwd.encode("utf-8")) == 72
        validate_password_rules(max_pwd)
        hashed = get_password_hash(max_pwd)
        assert verify_password(max_pwd, hashed) is True

    def test_oversized_password(self):
        """
        Test passwords that exceed 72 UTF-8 bytes are rejected with a clear validation error.
        Ensures passwords are never silently truncated.
        """
        oversized_ascii = "A" * 73
        assert len(oversized_ascii.encode("utf-8")) == 73
        with pytest.raises(ValueError, match=f"exceeds maximum supported limit of {MAX_PASSWORD_BYTES} UTF-8 bytes"):
            validate_password_rules(oversized_ascii)

        # Unicode characters taking 3-4 bytes each
        oversized_unicode = "🔒" * 20  # 20 * 4 bytes = 80 bytes
        assert len(oversized_unicode.encode("utf-8")) > 72
        with pytest.raises(ValueError, match=f"exceeds maximum supported limit of {MAX_PASSWORD_BYTES} UTF-8 bytes"):
            validate_password_rules(oversized_unicode)

    def test_unicode_password(self):
        """
        Test multi-byte Unicode characters (accents, symbols) within 72 bytes.
        """
        unicode_pwd = "Pässwörd!🔒🌱"
        encoded_len = len(unicode_pwd.encode("utf-8"))
        assert encoded_len <= 72
        assert encoded_len > len(unicode_pwd)  # Multi-byte verification

        validate_password_rules(unicode_pwd)
        hashed = get_password_hash(unicode_pwd)
        assert verify_password(unicode_pwd, hashed) is True
        assert verify_password("Pässwörd!🔒", hashed) is False

    def test_password_verification(self):
        """Test password verification correctly distinguishes matching and non-matching passwords."""
        pwd = "MySecretPass2026!"
        hashed = get_password_hash(pwd)
        assert verify_password(pwd, hashed) is True
        assert verify_password("WrongPassword123!", hashed) is False
        assert verify_password("", hashed) is False
        assert verify_password("A" * 100, hashed) is False


class TestAuthEndpoints:
    """
    Test suite for registration, login, logout, me, profile, and change password HTTP endpoints.
    """

    def test_successful_registration(self, client):
        payload = {
            "email": "newuser@example.com",
            "password": "ValidPassword123!",
            "full_name": "New User"
        }
        resp = client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["role"] == "USER"

    def test_registration_duplicate_email(self, client):
        payload = {
            "email": "testuser@wastewise.ai",
            "password": "ValidPassword123!",
            "full_name": "Duplicate User"
        }
        resp = client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"]

    def test_registration_oversized_password_rejected(self, client):
        payload = {
            "email": "oversized@example.com",
            "password": "A" * 75,
            "full_name": "Oversized User"
        }
        resp = client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 422
        assert "72 UTF-8 bytes" in str(resp.json())

    def test_successful_login(self, client):
        payload = {
            "email": "testuser@wastewise.ai",
            "password": "UserSecret123!"
        }
        resp = client.post("/api/v1/auth/login", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "testuser@wastewise.ai"

    def test_incorrect_login(self, client):
        # Wrong password
        resp = client.post("/api/v1/auth/login", json={
            "email": "testuser@wastewise.ai",
            "password": "WrongPassword999!"
        })
        assert resp.status_code == 401
        assert "Invalid email or password" in resp.json()["detail"]

        # Nonexistent user
        resp2 = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@wastewise.ai",
            "password": "UserSecret123!"
        })
        assert resp2.status_code == 401

    def test_get_current_user_me(self, client, user_token):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "testuser@wastewise.ai"
        assert data["role"] == "USER"

    def test_unauthenticated_request_rejected(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_update_profile(self, client, user_token):
        resp = client.put(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"full_name": "Updated Name"}
        )
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "Updated Name"

    def test_change_password(self, client, user_token):
        resp = client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "current_password": "UserSecret123!",
                "new_password": "NewSecretPassword2026!"
            }
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        # Verify login works with new password
        login_resp = client.post("/api/v1/auth/login", json={
            "email": "testuser@wastewise.ai",
            "password": "NewSecretPassword2026!"
        })
        assert login_resp.status_code == 200

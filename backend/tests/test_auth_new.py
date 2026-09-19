from datetime import timedelta
from app.core.security import create_access_token

def test_user_registration(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "Password123!",
            "full_name": "New User",
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"

def test_user_registration_duplicate_email(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "unique_username",
            "password": "Password123!",
        }
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"].lower()

def test_user_registration_duplicate_username(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "unique_email@example.com",
            "username": "testuser",
            "password": "Password123!",
        }
    )
    assert res.status_code == 409
    assert "taken" in res.json()["detail"].lower()

def test_user_registration_invalid_email(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalid-email-string",
            "username": "validname",
            "password": "Password123!",
        }
    )
    assert res.status_code in (400, 422)

def test_user_registration_weak_password(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "weakpass@example.com",
            "username": "weakuser",
            "password": "short",
        }
    )
    assert res.status_code in (400, 422)

def test_user_login_success(client):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123!",
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_user_login_failed(client):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword!",
        }
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_inactive_user_login(client):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactive@example.com",
            "password": "Password123!",
        }
    )
    assert res.status_code == 401

def test_auth_me_endpoint_success(client):
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123!",
        }
    )
    token = login_res.json()["access_token"]
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"

def test_auth_me_invalid_token(client):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token"}
    )
    assert res.status_code == 401

def test_auth_me_expired_token(client):
    expired_token = create_access_token(
        data={"sub": "1"},
        expires_delta=timedelta(minutes=-10)
    )
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert res.status_code == 401

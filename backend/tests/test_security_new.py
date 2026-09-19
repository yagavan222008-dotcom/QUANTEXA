from app.core.safe_errors_new import sanitize_sensitive_data, build_safe_error_response

def test_security_headers(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert "strict-origin" in res.headers.get("Referrer-Policy", "")

def test_cors_headers(client):
    res = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        }
    )
    assert res.status_code in (200, 204)
    assert res.headers.get("Access-Control-Allow-Origin") in ("http://localhost:3000", "*")

def test_sensitive_data_redaction():
    payload = {
        "user": "alice",
        "password": "SuperSecretPassword123",
        "api_key": "featherless_sk_123456789",
        "nested": {
            "token": "bearer_jwt_9999",
            "db_path": "C:\\Users\\admin\\db.sqlite",
        }
    }
    redacted = sanitize_sensitive_data(payload)
    assert redacted["password"] == "[REDACTED]"
    assert redacted["api_key"] == "[REDACTED]"
    assert redacted["nested"]["token"] == "[REDACTED]"

def test_safe_error_response():
    resp = build_safe_error_response(500, "Internal SQL query error at C:\\secret\\db.py")
    assert resp.status_code == 500
    body = resp.body.decode()
    assert "internal server error occurred" in body.lower()
    assert "C:\\secret\\db.py" not in body

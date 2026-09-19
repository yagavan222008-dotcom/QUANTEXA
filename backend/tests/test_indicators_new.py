def test_get_indicators_success(client):
    res = client.get("/api/v1/indicators/NVDA?sma_fast=5&sma_slow=10")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert "latest" in data
    latest = data["latest"]
    assert "sma_fast" in latest
    assert "sma_slow" in latest
    assert "annualized_volatility" in latest
    assert "series" in data
    assert len(data["series"]) > 0

def test_get_indicators_invalid_window(client):
    res = client.get("/api/v1/indicators/NVDA?sma_fast=0")
    assert res.status_code in (400, 422)

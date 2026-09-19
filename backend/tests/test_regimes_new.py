def test_get_regime_analysis_success(client):
    res = client.get("/api/v1/regimes/NVDA?return_window=10&volatility_window=10")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert "distribution" in data
    assert "performance" in data
    assert "series" in data

def test_get_regime_analysis_invalid_window(client):
    res = client.get("/api/v1/regimes/NVDA?return_window=0")
    assert res.status_code in (400, 422)

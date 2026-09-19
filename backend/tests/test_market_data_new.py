def test_get_assets_overview(client):
    res = client.get("/api/v1/assets/overview")
    assert res.status_code == 200
    data = res.json()
    assert "assets" in data
    symbols = [a["symbol"] for a in data["assets"]]
    assert "NVDA" in symbols

def test_get_market_data_valid(client):
    res = client.get("/api/v1/market-data/NVDA")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert "data" in data
    assert len(data["data"]) > 0
    first_point = data["data"][0]
    assert "open" in first_point
    assert "high" in first_point
    assert "low" in first_point
    assert "close" in first_point

def test_get_market_data_invalid_symbol(client):
    res = client.get("/api/v1/market-data/INVALID_TICKER_999")
    assert res.status_code == 404

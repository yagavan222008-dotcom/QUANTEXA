def test_validate_backtest_integrity_success(client):
    res = client.get("/api/v1/integrity/NVDA?initial_capital=100000.0&transaction_cost=0.001&slippage=0.001")
    assert res.status_code == 200
    data = res.json()
    assert "symbol" in data or "is_valid" in data or "checks" in data

def test_validate_backtest_integrity_invalid_symbol(client):
    res = client.get("/api/v1/integrity/NONEXISTENT_ASSET")
    assert res.status_code == 400

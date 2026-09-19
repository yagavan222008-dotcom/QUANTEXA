def test_risk_analysis_success(client):
    res = client.get("/api/v1/risk/NVDA")
    assert res.status_code == 200
    data = res.json()
    assert "sharpe_ratio" in data
    assert "maximum_drawdown" in data
    assert "annualized_volatility" in data

def test_risk_analysis_not_found(client):
    res = client.get("/api/v1/risk/NONEXISTENT_SYMBOL")
    assert res.status_code == 404

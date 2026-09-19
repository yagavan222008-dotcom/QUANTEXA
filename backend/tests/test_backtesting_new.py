def test_run_backtest_success(client):
    res = client.post(
        "/api/v1/backtests",
        json={
            "symbol": "NVDA",
            "strategy": "sma_crossover",
            "parameters": {"fast_period": 5, "slow_period": 20},
            "initial_capital": 100000.0,
            "transaction_cost": 0.001,
            "slippage": 0.001,
            "risk_free_rate": 0.02,
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert "metrics" in data
    assert "benchmark" in data
    assert "comparison" in data
    metrics = data["metrics"]
    assert "total_return" in metrics
    assert "sharpe_ratio" in metrics
    assert "maximum_drawdown" in metrics

def test_run_backtest_invalid_capital(client):
    res = client.post(
        "/api/v1/backtests",
        json={
            "symbol": "NVDA",
            "strategy": "sma_crossover",
            "initial_capital": -500.0,
        }
    )
    assert res.status_code in (400, 422)

def test_run_backtest_invalid_transaction_cost(client):
    res = client.post(
        "/api/v1/backtests",
        json={
            "symbol": "NVDA",
            "strategy": "sma_crossover",
            "transaction_cost": -0.05,
        }
    )
    assert res.status_code in (400, 422)

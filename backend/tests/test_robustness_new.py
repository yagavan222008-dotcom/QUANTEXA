from app.engines.robustness_service import RobustnessService

def test_run_robustness_service_direct(db_session):
    service = RobustnessService()
    res = service.run_robustness(
        db=db_session,
        symbol="NVDA",
        strategy_name="sma_crossover",
        parameter_grid={
            "fast_period": [5, 10],
            "slow_period": [15, 20]
        },
        transaction_costs=[0.0, 0.001],
        slippages=[0.0, 0.001],
        initial_capital=100000.0,
    )
    assert res["symbol"] == "NVDA"
    assert res["experiment_count"] > 0
    assert "return_statistics" in res
    assert "cost_sensitivity" in res

def test_run_robustness_endpoint_http_success(client):
    res = client.post(
        "/api/v1/robustness",
        json={
            "symbol": "NVDA",
            "strategy": "sma_crossover",
            "parameter_grid": {
                "fast_period": [5, 10],
                "slow_period": [15, 20]
            },
            "transaction_costs": [0.0, 0.001],
            "slippages": [0.0, 0.001],
            "initial_capital": 100000.0,
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert data["experiment_count"] > 0
    assert "return_statistics" in data
    assert "cost_sensitivity" in data
    assert "0.0" in data["cost_sensitivity"]
    # Confirm numeric values inside SensitivityStatistics remain numeric
    stat = data["cost_sensitivity"]["0.0"]
    assert isinstance(stat["mean_return"], (int, float))
    assert isinstance(stat["experiment_count"], int)

def test_run_robustness_invalid_symbol(client):
    res = client.post(
        "/api/v1/robustness",
        json={
            "symbol": "INVALID_SYMBOL_999",
            "strategy": "sma_crossover",
            "parameter_grid": {"fast_period": [5]},
        }
    )
    assert res.status_code == 400

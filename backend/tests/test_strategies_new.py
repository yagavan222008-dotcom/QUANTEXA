def test_get_available_strategies(client):
    res = client.get("/api/v1/strategies")
    assert res.status_code == 200
    data = res.json()
    assert "strategies" in data
    names = [s["name"] for s in data["strategies"]]
    assert len(names) > 0

def test_generate_strategy_signals_sma_crossover(client):
    res = client.post(
        "/api/v1/strategies/signals",
        json={
            "symbol": "NVDA",
            "strategy": "sma_crossover",
            "parameters": {"fast_period": 5, "slow_period": 20},
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert data["strategy"] == "sma_crossover"
    assert "signals" in data
    assert "signal_counts" in data

def test_generate_strategy_signals_invalid_strategy(client):
    res = client.post(
        "/api/v1/strategies/signals",
        json={
            "symbol": "NVDA",
            "strategy": "non_existent_strategy_name",
            "parameters": {},
        }
    )
    assert res.status_code == 400

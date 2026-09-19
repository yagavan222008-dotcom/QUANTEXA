from datetime import datetime

def test_create_and_get_experiment(client):
    res = client.post(
        "/api/v1/experiments",
        json={
            "name": "SMA Crossover Experiment 1",
            "dataset_id": 1,
            "description": "Testing SMA crossover strategy on synthetic data",
            "parameters": {"fast": 10, "slow": 30},
            "start_date": "2025-01-01T00:00:00Z",
            "end_date": "2025-03-01T00:00:00Z",
            "transaction_cost": 0.001,
            "slippage": 0.001,
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "SMA Crossover Experiment 1"
    exp_id = data["id"]

    # Retrieve experiment
    get_res = client.get(f"/api/v1/experiments/{exp_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "SMA Crossover Experiment 1"

def test_list_experiments(client):
    res = client.get("/api/v1/experiments?limit=10")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_nonexistent_experiment(client):
    res = client.get("/api/v1/experiments/999999")
    assert res.status_code == 404

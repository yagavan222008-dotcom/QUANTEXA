import pytest

def test_correlation_matrix_pearson(client):
    res = client.get("/api/v1/correlation?symbols=NVDA,BTC-USD,GC=F&method=pearson")
    assert res.status_code == 200
    data = res.json()
    assert data["method"] == "pearson"
    assert "matrix" in data
    matrix = data["matrix"]
    assert "NVDA" in matrix
    assert "BTC-USD" in matrix

def test_correlation_matrix_spearman(client):
    res = client.get("/api/v1/correlation?symbols=NVDA,BTC-USD,GC=F&method=spearman")
    assert res.status_code == 200
    data = res.json()
    assert data["method"] == "spearman"

def test_correlation_matrix_kendall(client):
    try:
        import scipy
    except ImportError:
        pytest.skip("scipy not installed for kendall correlation")
    res = client.get("/api/v1/correlation?symbols=NVDA,BTC-USD,GC=F&method=kendall")
    assert res.status_code == 200
    data = res.json()
    assert data["method"] == "kendall"

def test_rolling_correlation(client):
    res = client.get("/api/v1/correlation/rolling?asset_a=NVDA&asset_b=BTC-USD&window=20")
    assert res.status_code == 200
    data = res.json()
    assert data["asset_a"] == "NVDA"
    assert data["asset_b"] == "BTC-USD"
    assert data["window"] == 20
    assert "data" in data

def test_correlation_insufficient_assets(client):
    res = client.get("/api/v1/correlation?symbols=NVDA")
    assert res.status_code == 400
    assert "at least two assets" in res.json()["detail"].lower()

import sys
import os
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath("."))

TEST_DB_FILE = "./test_sqlite_runner.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

# Override settings before importing app modules
from app.core.config import settings
settings.DATABASE_URL = TEST_DATABASE_URL

import app.database.session as db_session_module
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
db_session_module.engine = test_engine
db_session_module.SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)

from app.database.base import Base
from app.database.session import get_db
from app.models.user import User
from app.models.asset import Asset
from app.models.market_data import MarketData
from app.models.dataset import Dataset
from app.core.security import hash_password

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Remove stale test file if present
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

    Base.metadata.create_all(bind=test_engine)
    session = db_session_module.SessionLocal()

    # Seed mock users
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hash_password("Password123!"),
        is_active=True,
        is_verified=True,
        role="user",
    )
    admin = User(
        email="admin@example.com",
        username="adminuser",
        hashed_password=hash_password("AdminPass123!"),
        is_active=True,
        is_verified=True,
        role="admin",
    )
    inactive = User(
        email="inactive@example.com",
        username="inactiveuser",
        hashed_password=hash_password("Password123!"),
        is_active=False,
        is_verified=False,
        role="user",
    )

    # Seed mock assets
    asset_nvda = Asset(symbol="NVDA", name="NVIDIA Corporation", asset_type="equity", currency="USD")
    asset_btc = Asset(symbol="BTC-USD", name="Bitcoin", asset_type="crypto", currency="USD")
    asset_gold = Asset(symbol="GC=F", name="Gold", asset_type="commodity", currency="USD")

    session.add_all([user, admin, inactive, asset_nvda, asset_btc, asset_gold])
    session.commit()
    session.refresh(asset_nvda)
    session.refresh(asset_btc)
    session.refresh(asset_gold)

    dt_start = datetime(2025, 1, 1)
    dt_end = dt_start + timedelta(days=100)

    ds_nvda = Dataset(asset_id=asset_nvda.id, source="synthetic", timeframe="1d", start_date=dt_start, end_date=dt_end, version="v1.0")
    ds_btc = Dataset(asset_id=asset_btc.id, source="synthetic", timeframe="1d", start_date=dt_start, end_date=dt_end, version="v1.0")
    ds_gold = Dataset(asset_id=asset_gold.id, source="synthetic", timeframe="1d", start_date=dt_start, end_date=dt_end, version="v1.0")

    session.add_all([ds_nvda, ds_btc, ds_gold])
    session.commit()
    session.refresh(ds_nvda)
    session.refresh(ds_btc)
    session.refresh(ds_gold)

    # Seed market prices for NVDA, BTC-USD, GC=F
    base_price = 100.0
    for i in range(100):
        dt = dt_start + timedelta(days=i)
        p1 = base_price * (1.0 + 0.002 * i + (0.01 if i % 2 == 0 else -0.008))
        p2 = 50000.0 * (1.0 + 0.005 * i + (0.02 if i % 3 == 0 else -0.015))
        p3 = 2000.0 * (1.0 + 0.001 * i + (0.005 if i % 2 == 0 else -0.004))

        m1 = MarketData(dataset_id=ds_nvda.id, timestamp=dt, open=p1, high=p1*1.01, low=p1*0.99, close=p1, volume=10000.0)
        m2 = MarketData(dataset_id=ds_btc.id, timestamp=dt, open=p2, high=p2*1.01, low=p2*0.99, close=p2, volume=50000.0)
        m3 = MarketData(dataset_id=ds_gold.id, timestamp=dt, open=p3, high=p3*1.01, low=p3*0.99, close=p3, volume=5000.0)
        session.add_all([m1, m2, m3])

    session.commit()
    session.close()

    yield

    test_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

@pytest.fixture(scope="function")
def db_session():
    session = db_session_module.SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def client(db_session):
    from app.main import app
    from fastapi.testclient import TestClient
    with TestClient(app) as test_client:
        yield test_client

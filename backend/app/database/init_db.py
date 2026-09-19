from datetime import datetime, timedelta
import math
from sqlalchemy.orm import Session

from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.asset import Asset
from app.models.dataset import Dataset
from app.models.market_data import MarketData


def init_db():
    Base.metadata.create_all(bind=engine)

    session: Session = SessionLocal()
    try:
        # Check if assets already seeded
        existing_assets = session.query(Asset).count()
        if existing_assets > 0:
            return

        print("[QUANTEXA DB Init] Seeding default assets and market data...")

        asset_definitions = [
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "asset_type": "equity", "currency": "USD", "base_price": 180.0, "volatility": 0.025},
            {"symbol": "BTC-USD", "name": "Bitcoin", "asset_type": "crypto", "currency": "USD", "base_price": 95000.0, "volatility": 0.035},
            {"symbol": "GC=F", "name": "Gold", "asset_type": "commodity", "currency": "USD", "base_price": 2650.0, "volatility": 0.012},
            {"symbol": "SPX", "name": "S&P 500", "asset_type": "index", "currency": "USD", "base_price": 5200.0, "volatility": 0.010},
        ]

        start_date = datetime.now() - timedelta(days=365)
        end_date = datetime.now()

        for defn in asset_definitions:
            asset = Asset(
                symbol=defn["symbol"],
                name=defn["name"],
                asset_type=defn["asset_type"],
                currency=defn["currency"],
            )
            session.add(asset)
            session.flush()

            dataset = Dataset(
                asset_id=asset.id,
                source="quantexa-feed",
                timeframe="1d",
                start_date=start_date,
                end_date=end_date,
                version="v1.0",
            )
            session.add(dataset)
            session.flush()

            current_price = defn["base_price"]
            vol = defn["volatility"]

            for i in range(365):
                dt = start_date + timedelta(days=i)
                drift = 0.0003
                osc = math.sin(i / 15.0) * vol
                change = drift + osc * 0.5 + (0.01 if (i * 7) % 11 > 5 else -0.008) * vol
                
                open_p = current_price
                close_p = max(1.0, open_p * (1.0 + change))
                high_p = max(open_p, close_p) * (1.0 + abs(math.cos(i)) * vol * 0.5)
                low_p = min(open_p, close_p) * (1.0 - abs(math.sin(i)) * vol * 0.5)
                volume = 100000.0 + (i * 137) % 50000

                md = MarketData(
                    dataset_id=dataset.id,
                    timestamp=dt,
                    open=open_p,
                    high=high_p,
                    low=low_p,
                    close=close_p,
                    volume=volume,
                )
                session.add(md)
                current_price = close_p

        session.commit()
        print("[QUANTEXA DB Init] Seeding complete.")

    except Exception as e:
        session.rollback()
        print(f"[QUANTEXA DB Init Error] {e}")
    finally:
        session.close()

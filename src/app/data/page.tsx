"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Gauge,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  Wifi,
} from "lucide-react";

import { getAssets } from "@/lib/api";

type AssetClass =
  | "All Assets"
  | "Equities"
  | "Indices"
  | "Commodities"
  | "Crypto";

type DataSource = {
  name: string;
  description: string;
  coverage: string;
  frequency: string;
  status: "Connected" | "Ready" | "Syncing";
  updated: string;
};

const dataSources: DataSource[] = [
  {
    name: "Equity Market Data",
    description:
      "Historical and market data for listed equities and major securities.",
    coverage: "8,500+ assets",
    frequency: "Daily / Intraday",
    status: "Connected",
    updated: "2 min ago",
  },
  {
    name: "Index Data",
    description:
      "Major global benchmark indices used for comparison and research.",
    coverage: "320+ indices",
    frequency: "Daily / Intraday",
    status: "Connected",
    updated: "4 min ago",
  },
  {
    name: "Commodity Data",
    description:
      "Pricing and historical observations for major commodity markets.",
    coverage: "85+ instruments",
    frequency: "Daily",
    status: "Connected",
    updated: "7 min ago",
  },
  {
    name: "Crypto Market Data",
    description:
      "Digital asset market observations for quantitative analysis.",
    coverage: "2,400+ assets",
    frequency: "1 min / Daily",
    status: "Ready",
    updated: "3 min ago",
  },
];

const assetCoverage = [
  {
    name: "Equities",
    count: "8,500+",
    description: "Listed companies and securities",
    icon: BarChart3,
  },
  {
    name: "Indices",
    count: "320+",
    description: "Global benchmark indices",
    icon: Activity,
  },
  {
    name: "Commodities",
    count: "85+",
    description: "Energy, metals and agriculture",
    icon: Gauge,
  },
  {
    name: "Crypto",
    count: "2,400+",
    description: "Digital assets and tokens",
    icon: Database,
  },
];

const historicalCoverage = [
  {
    label: "Equities",
    value: "15+ Years",
    percentage: 94,
  },
  {
    label: "Indices",
    value: "20+ Years",
    percentage: 98,
  },
  {
    label: "Commodities",
    value: "18+ Years",
    percentage: 91,
  },
  {
    label: "Crypto",
    value: "10+ Years",
    percentage: 76,
  },
];

export default function DataSourcesPage() {
  const [assetClass, setAssetClass] =
    useState<AssetClass>("All Assets");

  const [isSyncing, setIsSyncing] =
    useState(false);

  const [lastSync, setLastSync] =
    useState("2 minutes ago");

  const visibleSources = useMemo(() => {
    if (assetClass === "All Assets") {
      return dataSources;
    }

    const sourceMap: Record<
      Exclude<AssetClass, "All Assets">,
      string
    > = {
      Equities: "Equity Market Data",
      Indices: "Index Data",
      Commodities: "Commodity Data",
      Crypto: "Crypto Market Data",
    };

    return dataSources.filter(
      (source) =>
        source.name === sourceMap[assetClass]
    );
  }, [assetClass]);

  async function syncData() {
    if (isSyncing) return;

    setIsSyncing(true);

    try {
      await getAssets();
      setLastSync("Just now");
    } catch {
      setLastSync("Sync offline");
    } finally {
      setIsSyncing(false);
    }
  }

  function resetFilters() {
    setAssetClass("All Assets");
    setLastSync("2 minutes ago");
  }

  return (
    <main className="data-sources-page">

      {/* PAGE HEADER */}

      <header className="data-page-header">

        <div>

          <span className="data-breadcrumb">
            MARKET INFRASTRUCTURE
          </span>

          <h1>
            Data Sources
          </h1>

          <p>
            Monitor the market data infrastructure powering
            QuantExa research, analysis, backtesting and
            strategy validation.
          </p>

        </div>

        <div className="data-header-actions">

          <button
            type="button"
            className="data-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            type="button"
            className="data-sync-button"
            onClick={syncData}
            disabled={isSyncing}
          >
            <RefreshCw
              size={18}
              className={
                isSyncing
                  ? "data-sync-spin"
                  : ""
              }
            />

            {isSyncing
              ? "Syncing..."
              : "Sync Data"}
          </button>

        </div>

      </header>

      {/* ENGINE OVERVIEW */}

      <section className="data-engine-card">

        <div className="data-engine-main">

          <div className="data-engine-icon">
            <Server size={24} />
          </div>

          <div>

            <span>
              QUANTEXA DATA ENGINE
            </span>

            <h2>
              Market Data Infrastructure
            </h2>

            <p>
              Centralized market data feeds are available
              for quantitative research and strategy
              validation.
            </p>

          </div>

        </div>

        <div className="data-engine-status">

          <div className="data-live-indicator">
            <span />
            Operational
          </div>

          <div className="data-engine-meta">
            <span>
              Last synchronization
            </span>

            <strong>
              {lastSync}
            </strong>
          </div>

        </div>

      </section>

      {/* OVERVIEW METRICS */}

      <section className="data-metrics-grid">

        <div className="data-overview-metric">

          <div className="data-overview-icon">
            <Database size={20} />
          </div>

          <span>
            Total Assets
          </span>

          <strong>
            11,305+
          </strong>

          <small>
            Across supported markets
          </small>

        </div>

        <div className="data-overview-metric">

          <div className="data-overview-icon">
            <Clock3 size={20} />
          </div>

          <span>
            Historical Coverage
          </span>

          <strong>
            20+ Years
          </strong>

          <small>
            Long-term research history
          </small>

        </div>

        <div className="data-overview-metric">

          <div className="data-overview-icon">
            <Activity size={20} />
          </div>

          <span>
            Data Frequency
          </span>

          <strong>
            1 Min+
          </strong>

          <small>
            Depending on market
          </small>

        </div>

        <div className="data-overview-metric">

          <div className="data-overview-icon">
            <ShieldCheck size={20} />
          </div>

          <span>
            Data Quality
          </span>

          <strong>
            98.4%
          </strong>

          <small>
            Validation coverage
          </small>

        </div>

      </section>

      {/* ASSET FILTER */}

      <section className="data-card">

        <div className="data-card-header">

          <div>

            <span className="data-breadcrumb">
              DATA COVERAGE
            </span>

            <h2>
              Market Asset Coverage
            </h2>

            <p>
              Explore the markets currently supported by
              the QuantExa data layer.
            </p>

          </div>

          <div className="data-filter-wrapper">

            <select
              value={assetClass}
              onChange={(event) =>
                setAssetClass(
                  event.target.value as AssetClass
                )
              }
            >
              <option>
                All Assets
              </option>

              <option>
                Equities
              </option>

              <option>
                Indices
              </option>

              <option>
                Commodities
              </option>

              <option>
                Crypto
              </option>
            </select>

            <ChevronDown size={17} />

          </div>

        </div>

        <div className="asset-coverage-grid">

          {assetCoverage
            .filter((item) => {
              if (
                assetClass ===
                "All Assets"
              ) {
                return true;
              }

              return (
                item.name ===
                assetClass
              );
            })
            .map((item) => {

              const Icon = item.icon;

              return (
                <div
                  key={item.name}
                  className="asset-coverage-card"
                >

                  <div className="asset-coverage-icon">
                    <Icon size={20} />
                  </div>

                  <div>

                    <span>
                      {item.name}
                    </span>

                    <strong>
                      {item.count}
                    </strong>

                    <small>
                      {item.description}
                    </small>

                  </div>

                </div>
              );
            })}

        </div>

      </section>

      {/* DATA CONNECTIONS */}

      <section className="data-card">

        <div className="data-card-header">

          <div>

            <span className="data-breadcrumb">
              DATA CONNECTIONS
            </span>

            <h2>
              Market Data Feeds
            </h2>

            <p>
              Status and coverage of the data streams
              available to QuantExa.
            </p>

          </div>

          <div className="data-card-icon">
            <Wifi size={21} />
          </div>

        </div>

        <div className="data-source-list">

          {visibleSources.map(
            (source) => (
              <div
                key={source.name}
                className="data-source-row"
              >

                <div className="data-source-primary">

                  <div className="data-source-icon">
                    <Database size={19} />
                  </div>

                  <div>

                    <strong>
                      {source.name}
                    </strong>

                    <p>
                      {source.description}
                    </p>

                  </div>

                </div>

                <div className="data-source-stat">

                  <span>
                    Coverage
                  </span>

                  <strong>
                    {source.coverage}
                  </strong>

                </div>

                <div className="data-source-stat">

                  <span>
                    Frequency
                  </span>

                  <strong>
                    {source.frequency}
                  </strong>

                </div>

                <div className="data-source-updated">

                  <span
                    className={`data-status ${
                      source.status ===
                      "Connected"
                        ? "connected"
                        : "ready"
                    }`}
                  >
                    <span />

                    {source.status}
                  </span>

                  <small>
                    Updated{" "}
                    {source.updated}
                  </small>

                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* HISTORICAL COVERAGE */}

      <section className="data-card">

        <div className="data-card-header">

          <div>

            <span className="data-breadcrumb">
              HISTORICAL DATA
            </span>

            <h2>
              Historical Coverage
            </h2>

            <p>
              Availability of long-term observations
              across supported market categories.
            </p>

          </div>

          <div className="data-card-icon">
            <BarChart3 size={21} />
          </div>

        </div>

        <div className="historical-coverage-list">

          {historicalCoverage.map(
            (item) => (
              <div
                key={item.label}
                className="historical-coverage-row"
              >

                <div className="historical-coverage-label">

                  <strong>
                    {item.label}
                  </strong>

                  <span>
                    {item.value}
                  </span>

                </div>

                <div className="historical-progress">

                  <div
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />

                </div>

                <strong className="historical-percentage">
                  {item.percentage}%
                </strong>

              </div>
            )
          )}

        </div>

      </section>

      {/* DATA QUALITY */}

      <section className="data-quality-card">

        <div className="data-quality-icon">
          <CheckCircle2 size={23} />
        </div>

        <div>

          <span>
            QUANTEXA DATA QUALITY
          </span>

          <h2>
            Data infrastructure is ready for quantitative research.
          </h2>

          <p>
            Market observations are validated before being
            exposed to Asset Intelligence, Correlation Lab,
            Backtesting, Robustness and Regime Analysis.
          </p>

        </div>

        <div className="data-quality-score">

          <strong>
            98.4%
          </strong>

          <span>
            Quality Score
          </span>

        </div>

      </section>

      {/* FOOTER */}

      <div className="data-footer-status">

        <span className="data-status-dot" />

        <span>
          QuantExa Data Engine
        </span>

        <span>•</span>

        <span>
          All systems operational
        </span>

        <span>•</span>

        <span>
          Last sync {lastSync}
        </span>

      </div>

    </main>
  );
}
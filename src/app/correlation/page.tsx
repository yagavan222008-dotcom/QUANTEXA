"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  GitCompareArrows,
  Minus,
  Network,
} from "lucide-react";

import { assets } from "@/lib/mockMarketData";
import { getCorrelationMatrix, getRollingCorrelation } from "@/lib/api";

type CorrelationCell = {
  id: string;
  symbol: string;
  name: string;
  value: number;
};

const correlationMatrix: Record<
  string,
  Record<string, number>
> = {
  bitcoin: {
    bitcoin: 1.0,
    gold: 0.31,
    nvidia: 0.58,
    sp500: 0.72,
  },

  gold: {
    bitcoin: 0.31,
    gold: 1.0,
    nvidia: 0.18,
    sp500: 0.31,
  },

  nvidia: {
    bitcoin: 0.58,
    gold: 0.18,
    nvidia: 1.0,
    sp500: 0.81,
  },

  sp500: {
    bitcoin: 0.72,
    gold: 0.31,
    nvidia: 0.81,
    sp500: 1.0,
  },
};

const rollingCorrelation = [
  {
    label: "Jan",
    bitcoin: 0.48,
    gold: 0.28,
  },
  {
    label: "Feb",
    bitcoin: 0.52,
    gold: 0.31,
  },
  {
    label: "Mar",
    bitcoin: 0.58,
    gold: 0.27,
  },
  {
    label: "Apr",
    bitcoin: 0.64,
    gold: 0.35,
  },
  {
    label: "May",
    bitcoin: 0.61,
    gold: 0.32,
  },
  {
    label: "Jun",
    bitcoin: 0.69,
    gold: 0.38,
  },
  {
    label: "Jul",
    bitcoin: 0.72,
    gold: 0.31,
  },
];

function getCorrelationColor(
  value: number
) {
  if (value >= 0.75) {
    return "very-high";
  }

  if (value >= 0.5) {
    return "high";
  }

  if (value >= 0.25) {
    return "moderate";
  }

  if (value > 0) {
    return "low";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function getCorrelationLabel(
  value: number
) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 0.75) {
    return "Very strong";
  }

  if (absoluteValue >= 0.5) {
    return "Strong";
  }

  if (absoluteValue >= 0.25) {
    return "Moderate";
  }

  if (absoluteValue > 0) {
    return "Weak";
  }

  return "None";
}

function createPath(
  values: number[],
  minValue = 0,
  maxValue = 1
) {
  const width = 900;
  const height = 260;

  if (values.length === 0) {
    return "";
  }

  return values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : (index /
              (values.length - 1)) *
            width;

      const y =
        height -
        ((value - minValue) /
          (maxValue - minValue)) *
          height;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function CorrelationLabPage() {
  const [liveMatrix, setLiveMatrix] = useState<Record<string, Record<string, number>> | null>(null);
  const [liveRolling, setLiveRolling] = useState<number[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCorrelationMatrix(["NVDA", "BTC-USD", "GC=F", "SPX"], "pearson")
      .then((res) => {
        if (isMounted && res && res.matrix) {
          // Normalize matrix keys to asset.id keys
          const normalized: Record<string, Record<string, number>> = {};
          const keyMap: Record<string, string> = {
            "BTC-USD": "bitcoin",
            "BTCUSD": "bitcoin",
            "GC=F": "gold",
            "XAUUSD": "gold",
            "NVDA": "nvidia",
            "SPX": "sp500",
          };

          for (const [k1, row] of Object.entries(res.matrix)) {
            const mapped1 = keyMap[k1] || k1.toLowerCase();
            normalized[mapped1] = normalized[mapped1] || {};
            for (const [k2, val] of Object.entries(row)) {
              const mapped2 = keyMap[k2] || k2.toLowerCase();
              normalized[mapped1][mapped2] = val ?? 1.0;
            }
          }
          setLiveMatrix(normalized);
        }
      })
      .catch(() => {});

    getRollingCorrelation("BTC-USD", "SPX", 30)
      .then((res) => {
        if (isMounted && res && res.data && res.data.length > 0) {
          setLiveRolling(res.data.map((d) => d.correlation));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const activeMatrix = liveMatrix || correlationMatrix;

  const assetIds = assets.map((asset) => asset.id);
  const symbols = assets.map((asset) => asset.symbol);

  const strongestPairs: CorrelationCell[] = [];

  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const first = assets[i];
      const second = assets[j];
      const val = activeMatrix[first.id]?.[second.id] ?? correlationMatrix[first.id]?.[second.id] ?? 0.5;

      strongestPairs.push({
        id: `${first.id}-${second.id}`,
        symbol: `${first.symbol} / ${second.symbol}`,
        name: `${first.name} vs ${second.name}`,
        value: val,
      });
    }
  }

  const strongestPair =
    [...strongestPairs].sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value)
    )[0];

  const weakestPair =
    [...strongestPairs].sort(
      (a, b) => Math.abs(a.value) - Math.abs(b.value)
    )[0];

  const bitcoinGold = activeMatrix.bitcoin?.gold ?? correlationMatrix.bitcoin.gold;

  const bitcoinValues = liveRolling || rollingCorrelation.map((point) => point.bitcoin);
  const goldValues = rollingCorrelation.map((point) => point.gold);

  const bitcoinPath = createPath(bitcoinValues);
  const goldPath = createPath(goldValues);

  return (
    <main className="correlation-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="correlation-page-header">

        <div>

          <span className="asset-breadcrumb">
            QUANTITATIVE RESEARCH
          </span>

          <h1>
            Correlation Lab
          </h1>

          <p>
            Analyze relationships, diversification
            and co-movement across your asset universe.
          </p>

        </div>

        <div className="correlation-period-selector">

          <CalendarDays size={17} />

          <div>

            <span>
              ANALYSIS PERIOD
            </span>

            <strong>
              2025-09-19 → 2026-09-19
            </strong>

          </div>

        </div>

      </section>

      {/* =================================================
          ASSET UNIVERSE
      ================================================= */}

      <section className="correlation-universe">

        <div className="correlation-section-header">

          <div>

            <span className="asset-breadcrumb">
              ASSET UNIVERSE
            </span>

            <h2>
              Selected Assets
            </h2>

          </div>

          <div className="correlation-universe-count">
            <Network size={17} />
            <span>
              {assets.length} Assets
            </span>
          </div>

        </div>

        <div className="correlation-asset-list">

          {assets.map((asset) => (

            <div
              key={asset.id}
              className="correlation-asset-chip"
            >

              <div
                className="correlation-asset-icon"
                style={{
                  backgroundColor: `${asset.color}18`,
                  color: asset.color,
                }}
              >
                {asset.symbol === "BTCUSD"
                  ? "₿"
                  : asset.symbol ===
                      "XAUUSD"
                    ? "Au"
                    : asset.symbol ===
                        "NVDA"
                      ? "N"
                      : "500"}
              </div>

              <div>

                <strong>
                  {asset.name}
                </strong>

                <span>
                  {asset.symbol}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =================================================
          CORRELATION MATRIX
      ================================================= */}

      <section className="correlation-matrix-card">

        <div className="correlation-section-header">

          <div>

            <span className="asset-breadcrumb">
              CORRELATION MATRIX
            </span>

            <h2>
              Pairwise Asset Correlation
            </h2>

            <p>
              Pearson correlation coefficients
              across the selected analysis period.
            </p>

          </div>

          <div className="correlation-method">

            <BarChart3 size={17} />

            <span>
              Pearson
            </span>

          </div>

        </div>

        <div className="correlation-table-wrapper">

          <table className="correlation-table">

            <thead>

              <tr>

                <th>
                  Asset
                </th>

                {symbols.map(
                  (symbol) => (
                    <th key={symbol}>
                      {symbol}
                    </th>
                  )
                )}

              </tr>

            </thead>

            <tbody>

              {assetIds.map(
                (rowId) => {

                  const rowAsset =
                    assets.find(
                      (asset) =>
                        asset.id ===
                        rowId
                    );

                  if (!rowAsset) {
                    return null;
                  }

                  return (
                    <tr key={rowId}>

                      <th>

                        <div className="correlation-row-label">

                          <span
                            className="correlation-row-dot"
                            style={{
                              backgroundColor:
                                rowAsset.color,
                            }}
                          />

                          <span>
                            {rowAsset.symbol}
                          </span>

                        </div>

                      </th>

                      {assetIds.map(
                        (columnId) => {

                          const value =
                            activeMatrix[rowId]?.[columnId] ??
                            correlationMatrix[rowId]?.[columnId] ??
                            1.0;

                          const isDiagonal =
                            rowId ===
                            columnId;

                          return (
                            <td
                              key={`${rowId}-${columnId}`}
                            >

                              <div
                                className={`correlation-value ${getCorrelationColor(
                                  value
                                )} ${
                                  isDiagonal
                                    ? "diagonal"
                                    : ""
                                }`}
                              >
                                {value.toFixed(
                                  2
                                )}
                              </div>

                            </td>
                          );
                        }
                      )}

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        <div className="correlation-scale">

          <span>
            -1.00
          </span>

          <div className="correlation-scale-bar" />

          <span>
            0
          </span>

          <span>
            +1.00
          </span>

        </div>

      </section>

      {/* =================================================
          RELATIONSHIP SUMMARY
      ================================================= */}

      <section className="correlation-summary-grid">

        <div className="correlation-summary-card positive">

          <div className="correlation-summary-icon">
            <ArrowUpRight size={18} />
          </div>

          <span>
            STRONGEST RELATIONSHIP
          </span>

          <h3>
            {strongestPair.symbol}
          </h3>

          <strong>
            {strongestPair.value.toFixed(
              2
            )}
          </strong>

          <p>
            {getCorrelationLabel(
              strongestPair.value
            )} positive relationship.
          </p>

        </div>

        <div className="correlation-summary-card neutral">

          <div className="correlation-summary-icon">
            <Minus size={18} />
          </div>

          <span>
            WEAKEST RELATIONSHIP
          </span>

          <h3>
            {weakestPair.symbol}
          </h3>

          <strong>
            {weakestPair.value.toFixed(
              2
            )}
          </strong>

          <p>
            Lowest absolute correlation
            in the selected universe.
          </p>

        </div>

        <div className="correlation-summary-card blue">

          <div className="correlation-summary-icon">
            <GitCompareArrows size={18} />
          </div>

          <span>
            BTC / GOLD
          </span>

          <h3>
            Diversification Relationship
          </h3>

          <strong>
            {bitcoinGold.toFixed(2)}
          </strong>

          <p>
            Moderate positive relationship
            between Bitcoin and Gold.
          </p>

        </div>

      </section>

      {/* =================================================
          ROLLING CORRELATION
      ================================================= */}

      <section className="rolling-correlation-card">

        <div className="correlation-section-header">

          <div>

            <span className="asset-breadcrumb">
              ROLLING CORRELATION
            </span>

            <h2>
              Relationship Over Time
            </h2>

            <p>
              Observe how asset relationships
              change throughout the selected period.
            </p>

          </div>

          <div className="rolling-window">

            <Activity size={16} />

            <span>
              Rolling 30D
            </span>

          </div>

        </div>

        <div className="rolling-chart-wrapper">

          <div className="rolling-y-axis">

            <span>
              1.00
            </span>

            <span>
              0.75
            </span>

            <span>
              0.50
            </span>

            <span>
              0.25
            </span>

            <span>
              0
            </span>

          </div>

          <div className="rolling-chart-area">

            <div className="rolling-grid">

              <span />
              <span />
              <span />
              <span />
              <span />

            </div>

            <svg
              viewBox="0 0 900 260"
              preserveAspectRatio="none"
              className="rolling-svg"
            >

              <path
                d={bitcoinPath}
                fill="none"
                stroke="#2878ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={goldPath}
                fill="none"
                stroke="#f5b82e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </div>

        </div>

        <div className="rolling-labels">

          {rollingCorrelation.map(
            (point) => (
              <span key={point.label}>
                {point.label}
              </span>
            )
          )}

        </div>

        <div className="rolling-legend">

          <span>

            <i className="rolling-dot bitcoin" />

            BTC / S&amp;P 500

          </span>

          <span>

            <i className="rolling-dot gold" />

            Gold / S&amp;P 500

          </span>

        </div>

      </section>

      {/* =================================================
          ENGINE STATUS
      ================================================= */}

      <div className="correlation-engine-status">

        <span className="correlation-status-dot" />

        <span>
          QuantExa Correlation Engine
        </span>

        <span className="correlation-separator">
          •
        </span>

        <span>
          Pearson correlation analysis
        </span>

        <span className="correlation-separator">
          •
        </span>

        <span>
          Rolling 30D relationship analysis
        </span>

      </div>

    </main>
  );
}
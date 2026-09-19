"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  ChevronDown,
  Gauge,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Asset =
  | "Market Composite"
  | "S&P 500"
  | "Bitcoin"
  | "Gold"
  | "NVIDIA";

type Timeframe =
  | "1 Month"
  | "3 Months"
  | "6 Months"
  | "1 Year";

type Regime =
  | "Bull Market"
  | "Bear Market"
  | "Sideways Market";

type RegimeData = {
  regime: Regime;
  confidence: number;
  trendStrength: number;
  volatility: number;
  momentum: number;
};

const baseData: Record<Asset, RegimeData> = {
  "Market Composite": {
    regime: "Bull Market",
    confidence: 78,
    trendStrength: 82,
    volatility: 31,
    momentum: 74,
  },

  "S&P 500": {
    regime: "Bull Market",
    confidence: 84,
    trendStrength: 86,
    volatility: 24,
    momentum: 77,
  },

  Bitcoin: {
    regime: "Bull Market",
    confidence: 71,
    trendStrength: 79,
    volatility: 68,
    momentum: 88,
  },

  Gold: {
    regime: "Bull Market",
    confidence: 73,
    trendStrength: 69,
    volatility: 29,
    momentum: 66,
  },

  NVIDIA: {
    regime: "Bear Market",
    confidence: 68,
    trendStrength: 64,
    volatility: 59,
    momentum: 38,
  },
};

const regimeHistory = [
  {
    period: "Sep 2025",
    regime: "Sideways Market",
    strength: 46,
  },
  {
    period: "Oct 2025",
    regime: "Bull Market",
    strength: 62,
  },
  {
    period: "Nov 2025",
    regime: "Bull Market",
    strength: 71,
  },
  {
    period: "Dec 2025",
    regime: "Bull Market",
    strength: 76,
  },
  {
    period: "Jan 2026",
    regime: "Bull Market",
    strength: 81,
  },
  {
    period: "Feb 2026",
    regime: "Sideways Market",
    strength: 52,
  },
  {
    period: "Mar 2026",
    regime: "Bull Market",
    strength: 73,
  },
  {
    period: "Apr 2026",
    regime: "Bull Market",
    strength: 79,
  },
  {
    period: "May 2026",
    regime: "Bull Market",
    strength: 83,
  },
  {
    period: "Jun 2026",
    regime: "Bull Market",
    strength: 86,
  },
  {
    period: "Jul 2026",
    regime: "Bull Market",
    strength: 82,
  },
  {
    period: "Aug 2026",
    regime: "Bull Market",
    strength: 80,
  },
  {
    period: "Sep 2026",
    regime: "Bull Market",
    strength: 78,
  },
];

const regimePerformance = [
  {
    regime: "Bull Market",
    return: 18.6,
    volatility: 14.2,
    sharpe: 1.48,
    drawdown: -6.8,
  },
  {
    regime: "Bear Market",
    return: -12.4,
    volatility: 28.7,
    sharpe: -0.62,
    drawdown: -21.4,
  },
  {
    regime: "Sideways Market",
    return: 4.8,
    volatility: 17.9,
    sharpe: 0.54,
    drawdown: -8.7,
  },
];

function getRegimeClass(regime: Regime) {
  if (regime === "Bull Market") return "bull";
  if (regime === "Bear Market") return "bear";
  return "sideways";
}

function getRegimeIcon(regime: Regime) {
  if (regime === "Bull Market") {
    return <TrendingUp size={20} />;
  }

  if (regime === "Bear Market") {
    return <TrendingDown size={20} />;
  }

  return <Activity size={20} />;
}

function getAdjustedData(
  asset: Asset,
  timeframe: Timeframe
) {
  const data = baseData[asset];

  let confidenceAdjustment = 0;
  let trendAdjustment = 0;
  let volatilityAdjustment = 0;
  let momentumAdjustment = 0;

  if (timeframe === "1 Month") {
    confidenceAdjustment = -5;
    trendAdjustment = -3;
    volatilityAdjustment = 4;
    momentumAdjustment = 3;
  }

  if (timeframe === "3 Months") {
    confidenceAdjustment = -2;
    trendAdjustment = -1;
    volatilityAdjustment = 2;
    momentumAdjustment = 1;
  }

  if (timeframe === "6 Months") {
    confidenceAdjustment = 1;
    trendAdjustment = 1;
    volatilityAdjustment = 0;
    momentumAdjustment = 0;
  }

  if (timeframe === "1 Year") {
    confidenceAdjustment = 3;
    trendAdjustment = 2;
    volatilityAdjustment = -2;
    momentumAdjustment = -2;
  }

  if (asset === "Bitcoin") {
    volatilityAdjustment += 8;
  }

  if (asset === "NVIDIA") {
    volatilityAdjustment += 5;
  }

  return {
    ...data,
    confidence: Math.min(
      96,
      Math.max(
        40,
        data.confidence + confidenceAdjustment
      )
    ),
    trendStrength: Math.min(
      96,
      Math.max(
        20,
        data.trendStrength + trendAdjustment
      )
    ),
    volatility: Math.min(
      95,
      Math.max(
        10,
        data.volatility + volatilityAdjustment
      )
    ),
    momentum: Math.min(
      96,
      Math.max(
        15,
        data.momentum + momentumAdjustment
      )
    ),
  };
}

export default function RegimeAnalysisPage() {
  const [asset, setAsset] =
    useState<Asset>("Market Composite");

  const [timeframe, setTimeframe] =
    useState<Timeframe>("3 Months");

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [analysisVersion, setAnalysisVersion] =
    useState(0);

  const data = useMemo(
    () =>
      getAdjustedData(
        asset,
        timeframe
      ),
    [asset, timeframe, analysisVersion]
  );

  const regimeClass =
    getRegimeClass(data.regime);

  const regimeTimeline = useMemo(() => {
    return regimeHistory.map((item, index) => {
      let strength = item.strength;

      if (timeframe === "1 Month") {
        strength += index % 2 === 0 ? -4 : -2;
      }

      if (timeframe === "6 Months") {
        strength += index % 3 === 0 ? 2 : 1;
      }

      if (timeframe === "1 Year") {
        strength += 3;
      }

      if (asset === "Bitcoin") {
        strength += index % 2 === 0 ? 4 : -2;
      }

      if (asset === "NVIDIA") {
        strength -= 5;
      }

      return {
        ...item,
        strength: Math.min(
          95,
          Math.max(20, strength)
        ),
      };
    });
  }, [
    asset,
    timeframe,
    analysisVersion,
  ]);

  const currentRegimePerformance =
    useMemo(() => {
      const assetMultiplier =
        asset === "Bitcoin"
          ? 1.18
          : asset === "Gold"
            ? 0.82
            : asset === "NVIDIA"
              ? 0.74
              : asset === "S&P 500"
                ? 1.04
                : 1;

      const timeframeMultiplier =
        timeframe === "1 Month"
          ? 0.72
          : timeframe === "3 Months"
            ? 0.91
            : timeframe === "6 Months"
              ? 1
              : 1.08;

      return regimePerformance.map(
        (item) => ({
          ...item,
          return: Number(
            (
              item.return *
              assetMultiplier *
              timeframeMultiplier
            ).toFixed(1)
          ),
          volatility: Number(
            (
              item.volatility *
              (asset === "Bitcoin"
                ? 1.18
                : asset === "NVIDIA"
                  ? 1.1
                  : 1)
            ).toFixed(1)
          ),
          sharpe: Number(
            (
              item.sharpe *
              timeframeMultiplier
            ).toFixed(2)
          ),
          drawdown: Number(
            (
              item.drawdown *
              (asset === "Bitcoin"
                ? 1.22
                : asset === "NVIDIA"
                  ? 1.14
                  : 1)
            ).toFixed(1)
          ),
        })
      );
    }, [
      asset,
      timeframe,
      analysisVersion,
    ]);

  function refreshAnalysis() {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setAnalysisVersion(
        (value) => value + 1
      );

      setIsRefreshing(false);
    }, 650);
  }

  function resetAnalysis() {
    setAsset("Market Composite");
    setTimeframe("3 Months");
    setIsRefreshing(false);
    setAnalysisVersion(
      (value) => value + 1
    );
  }

  return (
    <main className="regime-page">

      {/* PAGE HEADER */}

      <header className="regime-page-header">

        <div>

          <span className="regime-breadcrumb">
            MARKET INTELLIGENCE
          </span>

          <h1>
            Regime Analysis
          </h1>

          <p>
            Identify the current market environment
            using trend, volatility, momentum and
            quantitative regime signals.
          </p>

        </div>

        <div className="regime-header-actions">

          <button
            type="button"
            className="regime-reset-button"
            onClick={resetAnalysis}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            type="button"
            className="regime-refresh-button"
            onClick={refreshAnalysis}
            disabled={isRefreshing}
          >
            <Activity size={18} />

            {isRefreshing
              ? "Analyzing..."
              : "Refresh Analysis"}
          </button>

        </div>

      </header>

      {/* CONFIGURATION */}

      <section className="regime-configuration">

        <div className="regime-section-header">

          <div className="regime-section-icon">
            <Gauge size={21} />
          </div>

          <div>

            <span>
              REGIME CONFIGURATION
            </span>

            <h2>
              Analysis Parameters
            </h2>

            <p>
              Select the market universe and analysis
              horizon used by the regime engine.
            </p>

          </div>

        </div>

        <div className="regime-form-grid">

          <div className="regime-form-group">

            <label>
              Market / Asset
            </label>

            <div className="regime-select-wrapper">

              <select
                value={asset}
                onChange={(event) =>
                  setAsset(
                    event.target.value as Asset
                  )
                }
              >

                <option>
                  Market Composite
                </option>

                <option>
                  S&P 500
                </option>

                <option>
                  Bitcoin
                </option>

                <option>
                  Gold
                </option>

                <option>
                  NVIDIA
                </option>

              </select>

              <ChevronDown size={18} />

            </div>

          </div>

          <div className="regime-form-group">

            <label>
              Analysis Timeframe
            </label>

            <div className="regime-select-wrapper">

              <select
                value={timeframe}
                onChange={(event) =>
                  setTimeframe(
                    event.target.value as Timeframe
                  )
                }
              >

                <option>
                  1 Month
                </option>

                <option>
                  3 Months
                </option>

                <option>
                  6 Months
                </option>

                <option>
                  1 Year
                </option>

              </select>

              <ChevronDown size={18} />

            </div>

          </div>

          <div className="regime-static-field">

            <span>
              Current Regime
            </span>

            <strong className={`regime-value ${regimeClass}`}>
              {data.regime}
            </strong>

          </div>

          <div className="regime-static-field">

            <span>
              Engine Confidence
            </span>

            <strong>
              {data.confidence}%
            </strong>

          </div>

        </div>

        <div className="regime-engine-status">

          <span className="regime-status-dot" />

          <span>
            QuantExa Regime Engine Ready
          </span>

          <span>•</span>

          <span>
            {asset}
          </span>

          <span>•</span>

          <span>
            {timeframe}
          </span>

        </div>

      </section>

      {/* CURRENT REGIME */}

      <section className={`current-regime-card ${regimeClass}`}>

        <div className="current-regime-main">

          <div className="current-regime-icon">
            {getRegimeIcon(data.regime)}
          </div>

          <div>

            <span>
              CURRENT MARKET REGIME
            </span>

            <h2>
              {data.regime}
            </h2>

            <p>
                {asset} is currently showing a{" "}
                <strong>
                    {data.regime.toLowerCase()}
                </strong>{" "}
                over the selected{" "}
                <strong>
                    {timeframe.toLowerCase()}
                </strong>{" "}
                analysis horizon.
            </p>

          </div>

        </div>

        <div className="current-regime-confidence">

          <span>
            REGIME CONFIDENCE
          </span>

          <strong>
            {data.confidence}%
          </strong>

          <div className="confidence-bar">

            <div
              style={{
                width: `${data.confidence}%`,
              }}
            />

          </div>

          <small>
            QuantExa regime classification confidence
          </small>

        </div>

      </section>

      {/* REGIME SIGNALS */}

      <section className="regime-card">

        <div className="regime-card-header">

          <div>

            <span className="regime-breadcrumb">
              REGIME SIGNALS
            </span>

            <h2>
              Market Environment
            </h2>

            <p>
              Quantitative indicators contributing to
              the current regime classification.
            </p>

          </div>

          <div className="regime-card-icon">
            <Activity size={21} />
          </div>

        </div>

        <div className="regime-signal-grid">

          <div className="regime-signal-card">

            <div className="regime-signal-top">

              <div className="regime-signal-icon">
                <TrendingUp size={19} />
              </div>

              <span>
                Trend Strength
              </span>

            </div>

            <strong>
              {data.trendStrength}%
            </strong>

            <div className="signal-progress">

              <div
                style={{
                  width: `${data.trendStrength}%`,
                }}
              />

            </div>

            <small>
              Directional price structure
            </small>

          </div>

          <div className="regime-signal-card">

            <div className="regime-signal-top">

              <div className="regime-signal-icon">
                <Activity size={19} />
              </div>

              <span>
                Volatility
              </span>

            </div>

            <strong>
              {data.volatility}%
            </strong>

            <div className="signal-progress">

              <div
                style={{
                  width: `${data.volatility}%`,
                }}
              />

            </div>

            <small>
              Relative volatility environment
            </small>

          </div>

          <div className="regime-signal-card">

            <div className="regime-signal-top">

              <div className="regime-signal-icon">
                <TrendingUp size={19} />
              </div>

              <span>
                Momentum
              </span>

            </div>

            <strong>
              {data.momentum}%
            </strong>

            <div className="signal-progress">

              <div
                style={{
                  width: `${data.momentum}%`,
                }}
              />

            </div>

            <small>
              Recent directional momentum
            </small>

          </div>

          <div className="regime-signal-card">

            <div className="regime-signal-top">

              <div className="regime-signal-icon">
                <ShieldCheck size={19} />
              </div>

              <span>
                Confidence
              </span>

            </div>

            <strong>
              {data.confidence}%
            </strong>

            <div className="signal-progress">

              <div
                style={{
                  width: `${data.confidence}%`,
                }}
              />

            </div>

            <small>
              Classification confidence
            </small>

          </div>

        </div>

      </section>

      {/* HISTORY */}

      <section className="regime-card">

        <div className="regime-card-header">

          <div>

            <span className="regime-breadcrumb">
              REGIME HISTORY
            </span>

            <h2>
              Market Regime Timeline
            </h2>

            <p>
              Historical changes in the detected market
              environment.
            </p>

          </div>

          <div className="regime-card-icon">
            <BarChart3 size={21} />
          </div>

        </div>

        <div className="regime-timeline">

          <div className="regime-timeline-y">

            <span>
              100
            </span>

            <span>
              75
            </span>

            <span>
              50
            </span>

            <span>
              25
            </span>

            <span>
              0
            </span>

          </div>

          <div className="regime-timeline-chart">

            <div className="regime-timeline-grid">

              <span />
              <span />
              <span />
              <span />
              <span />

            </div>

            <svg
              viewBox="0 0 1000 330"
              preserveAspectRatio="none"
              className="regime-timeline-svg"
            >

              <polyline
                points={regimeTimeline
                  .map(
                    (item, index) => {
                      const x =
                        (index /
                          (regimeTimeline.length -
                            1)) *
                        1000;

                      const y =
                        330 -
                        (item.strength /
                          100) *
                          330;

                      return `${x},${y}`;
                    }
                  )
                  .join(" ")}
                fill="none"
                stroke="#2878ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {regimeTimeline.map(
                (item, index) => {

                  const x =
                    (index /
                      (regimeTimeline.length -
                        1)) *
                    1000;

                  const y =
                    330 -
                    (item.strength /
                      100) *
                      330;

                  return (
                    <circle
                      key={`${item.period}-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#2878ff"
                    />
                  );
                }
              )}

            </svg>

          </div>

        </div>

        <div className="regime-timeline-labels">

          {regimeTimeline.map(
            (item) => (
              <span key={item.period}>
                {item.period}
              </span>
            )
          )}

        </div>

        <div className="regime-timeline-legend">

          <div>
            <span className="timeline-dot bull" />
            <span>
              Bull Market
            </span>
          </div>

          <div>
            <span className="timeline-dot sideways" />
            <span>
              Sideways Market
            </span>
          </div>

          <div>
            <span className="timeline-dot bear" />
            <span>
              Bear Market
            </span>
          </div>

        </div>

      </section>

      {/* REGIME PERFORMANCE */}

      <section className="regime-card">

        <div className="regime-card-header">

          <div>

            <span className="regime-breadcrumb">
              REGIME PERFORMANCE
            </span>

            <h2>
              Historical Performance by Regime
            </h2>

            <p>
              Compare how the selected market universe
              behaves under different market environments.
            </p>

          </div>

          <div className="regime-card-icon">
            <BarChart3 size={21} />
          </div>

        </div>

        <div className="regime-performance-table">

          <div className="regime-performance-header">

            <span>
              Market Regime
            </span>

            <span>
              Return
            </span>

            <span>
              Volatility
            </span>

            <span>
              Sharpe
            </span>

            <span>
              Max Drawdown
            </span>

          </div>

          {currentRegimePerformance.map(
            (item) => {

              const current =
                item.regime ===
                data.regime;

              return (
                <div
                  key={item.regime}
                  className={`regime-performance-row ${
                    current
                      ? "current"
                      : ""
                  }`}
                >

                  <div className="regime-performance-name">

                    <span
                      className={`regime-table-dot ${getRegimeClass(
                        item.regime as Regime
                      )}`}
                    />

                    <strong>
                      {item.regime}
                    </strong>

                    {current && (
                      <span className="current-badge">
                        Current
                      </span>
                    )}

                  </div>

                  <strong
                    className={
                      item.return >= 0
                        ? "positive-number"
                        : "negative-number"
                    }
                  >
                    {item.return >= 0
                      ? "+"
                      : ""}
                    {item.return.toFixed(1)}%
                  </strong>

                  <strong>
                    {item.volatility.toFixed(1)}%
                  </strong>

                  <strong
                    className={
                      item.sharpe >= 0
                        ? "positive-number"
                        : "negative-number"
                    }
                  >
                    {item.sharpe.toFixed(2)}
                  </strong>

                  <strong className="negative-number">
                    {item.drawdown.toFixed(1)}%
                  </strong>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* INTERPRETATION */}

      <section className={`regime-interpretation ${regimeClass}`}>

        <div className="regime-interpretation-icon">
          {getRegimeIcon(data.regime)}
        </div>

        <div>

          <span>
            QUANTEXA REGIME INTERPRETATION
          </span>

          <h2>
            {asset} is currently classified as a{" "}
            {data.regime.toLowerCase()}.
          </h2>

          <p>
            The classification is supported by a{" "}
            <strong>
              {data.trendStrength}% trend-strength
            </strong>{" "}
            reading,{" "}
            <strong>
              {data.momentum}% momentum
            </strong>{" "}
            and{" "}
            <strong>
              {data.volatility}% relative volatility
            </strong>
            . The regime engine assigns{" "}
            <strong>
              {data.confidence}% confidence
            </strong>{" "}
            to the current classification.
          </p>

        </div>

      </section>

      {/* FOOTER */}

      <div className="regime-footer-status">

        <span className="regime-status-dot" />

        <span>
          QuantExa Regime Engine
        </span>

        <span>•</span>

        <span>
          {asset}
        </span>

        <span>•</span>

        <span>
          {timeframe}
        </span>

        <span>•</span>

        <span>
          Live analysis ready
        </span>

      </div>

    </main>
  );
}
"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  Layers3,
  Percent,
  Play,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { assets } from "@/lib/mockMarketData";

type StrategyType =
  | "Trend Following"
  | "Mean Reversion"
  | "Momentum"
  | "Breakout";

type PositionSizing =
  | "Fixed Amount"
  | "Fixed Percentage"
  | "Volatility Adjusted";

type Timeframe =
  | "5m"
  | "15m"
  | "1H"
  | "4H"
  | "1D";

const strategyTypes: StrategyType[] = [
  "Trend Following",
  "Mean Reversion",
  "Momentum",
  "Breakout",
];

const timeframes: Timeframe[] = [
  "5m",
  "15m",
  "1H",
  "4H",
  "1D",
];

const positionSizingOptions: PositionSizing[] = [
  "Fixed Amount",
  "Fixed Percentage",
  "Volatility Adjusted",
];

export default function StrategyLabPage() {
  const [strategyName, setStrategyName] =
    useState("Momentum Alpha");

  const [strategyType, setStrategyType] =
    useState<StrategyType>("Momentum");

  const [timeframe, setTimeframe] =
    useState<Timeframe>("1D");

  const [selectedAssets, setSelectedAssets] =
    useState<string[]>([
      "bitcoin",
      "gold",
      "nvidia",
      "sp500",
    ]);

  const [positionSizing, setPositionSizing] =
    useState<PositionSizing>(
      "Fixed Percentage"
    );

  const [positionSize, setPositionSize] =
    useState(25);

  const [stopLoss, setStopLoss] =
    useState(5);

  const [takeProfit, setTakeProfit] =
    useState(12);

  const [fastPeriod, setFastPeriod] =
    useState(20);

  const [slowPeriod, setSlowPeriod] =
    useState(50);

  const [riskPerTrade, setRiskPerTrade] =
    useState(2);

  const [strategyGenerated, setStrategyGenerated] =
    useState(false);

  function toggleAsset(assetId: string) {
    setSelectedAssets((current) => {
      if (current.includes(assetId)) {
        return current.filter(
          (id) => id !== assetId
        );
      }

      return [...current, assetId];
    });
  }

  function resetStrategy() {
    setStrategyName("Momentum Alpha");
    setStrategyType("Momentum");
    setTimeframe("1D");
    setSelectedAssets([
      "bitcoin",
      "gold",
      "nvidia",
      "sp500",
    ]);
    setPositionSizing("Fixed Percentage");
    setPositionSize(25);
    setStopLoss(5);
    setTakeProfit(12);
    setFastPeriod(20);
    setSlowPeriod(50);
    setRiskPerTrade(2);
    setStrategyGenerated(false);
  }

  const selectedAssetNames = useMemo(() => {
    return assets
      .filter((asset) =>
        selectedAssets.includes(asset.id)
      )
      .map((asset) => asset.name);
  }, [selectedAssets]);

  const expectedReturn =
    strategyType === "Momentum"
      ? 18.4
      : strategyType === "Trend Following"
        ? 15.8
        : strategyType === "Mean Reversion"
          ? 11.6
          : 21.2;

  const expectedVolatility =
    strategyType === "Breakout"
      ? 28.4
      : strategyType === "Momentum"
        ? 24.7
        : strategyType === "Trend Following"
          ? 19.8
          : 16.9;

  const estimatedSharpe =
    expectedReturn / expectedVolatility;

  return (
    <main className="strategy-lab-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="strategy-page-header">

        <div>

          <span className="asset-breadcrumb">
            QUANTITATIVE STRATEGY RESEARCH
          </span>

          <h1>
            Strategy Lab
          </h1>

          <p>
            Design, configure and prepare quantitative
            trading strategies for backtesting.
          </p>

        </div>

        <div className="strategy-header-actions">

          <button
            type="button"
            className="strategy-reset-button"
            onClick={resetStrategy}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            className="strategy-generate-button"
            onClick={() =>
              setStrategyGenerated(true)
            }
          >
            <Play size={16} />
            Generate Strategy
          </button>

        </div>

      </section>

      {/* =================================================
          MAIN WORKSPACE
      ================================================= */}

      <div className="strategy-workspace">

        {/* =================================================
            LEFT — CONFIGURATION
        ================================================= */}

        <section className="strategy-builder-card">

          <div className="strategy-card-header">

            <div>

              <span className="asset-breadcrumb">
                STRATEGY BUILDER
              </span>

              <h2>
                Strategy Configuration
              </h2>

              <p>
                Define the rules and risk parameters
                for your quantitative strategy.
              </p>

            </div>

            <div className="strategy-builder-icon">
              <SlidersHorizontal size={20} />
            </div>

          </div>

          {/* Strategy Name */}

          <div className="strategy-field">

            <label>
              Strategy Name
            </label>

            <input
              type="text"
              value={strategyName}
              onChange={(event) =>
                setStrategyName(
                  event.target.value
                )
              }
              placeholder="Enter strategy name"
            />

          </div>

          {/* Strategy Type */}

          <div className="strategy-field">

            <label>
              Strategy Type
            </label>

            <div className="strategy-select-wrapper">

              <select
                value={strategyType}
                onChange={(event) =>
                  setStrategyType(
                    event.target
                      .value as StrategyType
                  )
                }
              >
                {strategyTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={16} />

            </div>

          </div>

          {/* Timeframe */}

          <div className="strategy-field">

            <label>
              Timeframe
            </label>

            <div className="strategy-timeframe-list">

              {timeframes.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      timeframe === item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setTimeframe(item)
                    }
                  >
                    {item}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Asset Universe */}

          <div className="strategy-field">

            <label>
              Asset Universe
            </label>

            <div className="strategy-asset-grid">

              {assets.map((asset) => {

                const selected =
                  selectedAssets.includes(
                    asset.id
                  );

                return (
                  <button
                    key={asset.id}
                    type="button"
                    className={`strategy-asset-option ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleAsset(
                        asset.id
                      )
                    }
                  >

                    <div
                      className="strategy-asset-icon"
                      style={{
                        color: asset.color,
                        backgroundColor:
                          `${asset.color}18`,
                      }}
                    >
                      {asset.symbol ===
                      "BTCUSD"
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

                    <div className="strategy-check">

                      {selected && (
                        <Check size={13} />
                      )}

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

          {/* Entry Rules */}

          <div className="strategy-rule-section">

            <div className="strategy-rule-header">

              <div className="strategy-rule-icon positive">
                <TrendingUp size={17} />
              </div>

              <div>

                <h3>
                  Entry Conditions
                </h3>

                <span>
                  Conditions required to open a position
                </span>

              </div>

            </div>

            <div className="strategy-rule-grid">

              <div className="strategy-rule-box">

                <span>
                  Fast MA
                </span>

                <strong>
                  SMA {fastPeriod}
                </strong>

              </div>

              <div className="strategy-rule-box">

                <span>
                  Slow MA
                </span>

                <strong>
                  SMA {slowPeriod}
                </strong>

              </div>

              <div className="strategy-rule-box">

                <span>
                  Signal
                </span>

                <strong>
                  Fast &gt; Slow
                </strong>

              </div>

            </div>

          </div>

          {/* Exit Rules */}

          <div className="strategy-rule-section">

            <div className="strategy-rule-header">

              <div className="strategy-rule-icon negative">
                <TrendingDown size={17} />
              </div>

              <div>

                <h3>
                  Exit Conditions
                </h3>

                <span>
                  Conditions used to close a position
                </span>

              </div>

            </div>

            <div className="strategy-rule-grid">

              <div className="strategy-rule-box">

                <span>
                  Stop Loss
                </span>

                <strong>
                  {stopLoss}%
                </strong>

              </div>

              <div className="strategy-rule-box">

                <span>
                  Take Profit
                </span>

                <strong>
                  {takeProfit}%
                </strong>

              </div>

              <div className="strategy-rule-box">

                <span>
                  Exit Signal
                </span>

                <strong>
                  MA Cross
                </strong>

              </div>

            </div>

          </div>

          {/* Risk Parameters */}

          <div className="strategy-rule-section">

            <div className="strategy-rule-header">

              <div className="strategy-rule-icon blue">
                <ShieldCheck size={17} />
              </div>

              <div>

                <h3>
                  Risk Parameters
                </h3>

                <span>
                  Capital and position management
                </span>

              </div>

            </div>

            <div className="strategy-input-grid">

              <div className="strategy-field">

                <label>
                  Position Sizing
                </label>

                <div className="strategy-select-wrapper">

                  <select
                    value={positionSizing}
                    onChange={(event) =>
                      setPositionSizing(
                        event.target
                          .value as PositionSizing
                      )
                    }
                  >
                    {positionSizingOptions.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown size={16} />

                </div>

              </div>

              <div className="strategy-field">

                <label>
                  Position Size
                </label>

                <div className="strategy-number-input">

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={positionSize}
                    onChange={(event) =>
                      setPositionSize(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />

                  <span>
                    %
                  </span>

                </div>

              </div>

              <div className="strategy-field">

                <label>
                  Risk / Trade
                </label>

                <div className="strategy-number-input">

                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={riskPerTrade}
                    onChange={(event) =>
                      setRiskPerTrade(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />

                  <span>
                    %
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RIGHT — PREVIEW
        ================================================= */}

        <aside className="strategy-preview-column">

          {/* Strategy Preview */}

          <section className="strategy-preview-card">

            <div className="strategy-preview-header">

              <div>

                <span className="asset-breadcrumb">
                  STRATEGY PREVIEW
                </span>

                <h2>
                  {strategyName}
                </h2>

              </div>

              <div className="strategy-status-pill">

                <span />

                Draft

              </div>

            </div>

            <div className="strategy-preview-type">

              <div className="strategy-preview-type-icon">
                <Activity size={18} />
              </div>

              <div>

                <strong>
                  {strategyType}
                </strong>

                <span>
                  {timeframe} execution
                </span>

              </div>

            </div>

            <div className="strategy-preview-stats">

              <div>

                <span>
                  Assets
                </span>

                <strong>
                  {selectedAssets.length}
                </strong>

              </div>

              <div>

                <span>
                  Position
                </span>

                <strong>
                  {positionSize}%
                </strong>

              </div>

              <div>

                <span>
                  Risk
                </span>

                <strong>
                  {riskPerTrade}%
                </strong>

              </div>

            </div>

            <div className="strategy-preview-rules">

              <div>

                <Check size={15} />

                <span>
                  SMA {fastPeriod} crosses above
                  SMA {slowPeriod}
                </span>

              </div>

              <div>

                <Check size={15} />

                <span>
                  Position size limited to{" "}
                  {positionSize}%
                </span>

              </div>

              <div>

                <Check size={15} />

                <span>
                  Stop loss at {stopLoss}%
                </span>

              </div>

              <div>

                <Check size={15} />

                <span>
                  Take profit at {takeProfit}%
                </span>

              </div>

            </div>

          </section>

          {/* Expected Metrics */}

          <section className="strategy-metrics-card">

            <div className="strategy-small-header">

              <div>

                <span className="asset-breadcrumb">
                  EXPECTED PROFILE
                </span>

                <h3>
                  Strategy Characteristics
                </h3>

              </div>

              <Gauge size={19} />

            </div>

            <div className="strategy-metric-row">

              <div className="strategy-metric-icon positive">
                <TrendingUp size={16} />
              </div>

              <div>

                <span>
                  Expected Return
                </span>

                <strong className="positive-text">
                  +{expectedReturn.toFixed(1)}%
                </strong>

              </div>

            </div>

            <div className="strategy-metric-row">

              <div className="strategy-metric-icon warning">
                <Activity size={16} />
              </div>

              <div>

                <span>
                  Expected Volatility
                </span>

                <strong>
                  {expectedVolatility.toFixed(1)}%
                </strong>

              </div>

            </div>

            <div className="strategy-metric-row">

              <div className="strategy-metric-icon blue">
                <BarChart3 size={16} />
              </div>

              <div>

                <span>
                  Estimated Sharpe
                </span>

                <strong>
                  {estimatedSharpe.toFixed(2)}
                </strong>

              </div>

            </div>

          </section>

          {/* Selected Assets */}

          <section className="strategy-assets-card">

            <div className="strategy-small-header">

              <div>

                <span className="asset-breadcrumb">
                  ASSET UNIVERSE
                </span>

                <h3>
                  Selected Assets
                </h3>

              </div>

              <Layers3 size={19} />

            </div>

            <div className="strategy-selected-assets">

              {selectedAssetNames.length ===
              0 ? (
                <div className="strategy-empty-assets">
                  Select at least one asset.
                </div>
              ) : (
                selectedAssetNames.map(
                  (name) => (
                    <span key={name}>
                      {name}
                    </span>
                  )
                )
              )}

            </div>

          </section>

        </aside>

      </div>

      {/* =================================================
          GENERATION RESULT
      ================================================= */}

      {strategyGenerated && (
        <section className="strategy-generated-card">

          <div className="strategy-generated-icon">
            <Check size={21} />
          </div>

          <div>

            <span>
              STRATEGY CONFIGURATION READY
            </span>

            <h3>
              {strategyName} is ready for
              backtesting.
            </h3>

            <p>
              QuantExa has prepared the strategy
              configuration using{" "}
              <strong>
                {strategyType}
              </strong>{" "}
              logic across{" "}
              <strong>
                {selectedAssets.length} assets
              </strong>{" "}
              on the{" "}
              <strong>
                {timeframe}
              </strong>{" "}
              timeframe.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setStrategyGenerated(false)
            }
          >
            <CircleDollarSign size={16} />
            Continue to Backtesting
          </button>

        </section>
      )}

      {/* =================================================
          ENGINE STATUS
      ================================================= */}

      <div className="strategy-engine-status">

        <span className="strategy-engine-dot" />

        <span>
          QuantExa Strategy Engine
        </span>

        <span className="strategy-engine-separator">
          •
        </span>

        <span>
          Strategy configuration workspace
        </span>

        <span className="strategy-engine-separator">
          •
        </span>

        <span>
          Ready for backtesting
        </span>

      </div>

    </main>
  );
}
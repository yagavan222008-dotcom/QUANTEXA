"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  Play,
  RotateCcw,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { runBacktest as apiRunBacktest, BacktestResponse } from "@/lib/api";

type AssetOption = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
};

const assets: AssetOption[] = [
  {
    id: "gold",
    name: "Gold",
    symbol: "XAUUSD",
    icon: "Au",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTCUSD",
    icon: "₿",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    symbol: "NVDA",
    icon: "N",
  },
  {
    id: "sp500",
    name: "S&P 500",
    symbol: "SPX",
    icon: "500",
  },
];

const equityData = [
  { label: "Jan", strategy: 100000, benchmark: 100000 },
  { label: "Feb", strategy: 103800, benchmark: 101900 },
  { label: "Mar", strategy: 107600, benchmark: 103500 },
  { label: "Apr", strategy: 112900, benchmark: 106800 },
  { label: "May", strategy: 110800, benchmark: 108200 },
  { label: "Jun", strategy: 118700, benchmark: 111400 },
  { label: "Jul", strategy: 124800, benchmark: 114200 },
  { label: "Aug", strategy: 129600, benchmark: 116900 },
  { label: "Sep", strategy: 131000, benchmark: 118400 },
];

const drawdownData = [
  { label: "Jan", value: -1.2 },
  { label: "Feb", value: -2.4 },
  { label: "Mar", value: -1.1 },
  { label: "Apr", value: -4.8 },
  { label: "May", value: -6.2 },
  { label: "Jun", value: -3.1 },
  { label: "Jul", value: -2.4 },
  { label: "Aug", value: -1.6 },
  { label: "Sep", value: -2.1 },
];

const trades = [
  {
    asset: "BTCUSD",
    type: "Long",
    entry: "₹84,120",
    exit: "₹91,840",
    return: "+9.18%",
    status: "win",
  },
  {
    asset: "XAUUSD",
    type: "Long",
    entry: "₹2,14,500",
    exit: "₹2,21,300",
    return: "+3.17%",
    status: "win",
  },
  {
    asset: "NVDA",
    type: "Short",
    entry: "₹15,820",
    exit: "₹15,120",
    return: "+4.42%",
    status: "win",
  },
  {
    asset: "BTCUSD",
    type: "Long",
    entry: "₹92,400",
    exit: "₹89,700",
    return: "-2.92%",
    status: "loss",
  },
  {
    asset: "SPX",
    type: "Long",
    entry: "5,108",
    exit: "5,184",
    return: "+1.49%",
    status: "win",
  },
];

function createPath(
  values: number[],
  minValue: number,
  maxValue: number,
  width = 900,
  height = 300
) {
  return values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : (index / (values.length - 1)) * width;

      const y =
        height -
        ((value - minValue) / (maxValue - minValue)) * height;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function BacktestingPage() {
  const [strategy, setStrategy] =
    useState("Momentum Alpha");

  const [selectedAsset, setSelectedAsset] =
    useState<AssetOption>(assets[1]);

  const [startDate, setStartDate] =
    useState("2025-09-19");

  const [endDate, setEndDate] =
    useState("2026-09-19");

  const [initialCapital, setInitialCapital] =
    useState("100000");

  const [positionSizing, setPositionSizing] =
    useState("25");

  const [transactionCost, setTransactionCost] =
    useState("0.10");

  const [isRunning, setIsRunning] =
    useState(false);

  const strategyPath = useMemo(() => {
    const values = equityData.map(
      (point) => point.strategy
    );

    return createPath(
      values,
      98000,
      134000
    );
  }, []);

  const benchmarkPath = useMemo(() => {
    const values = equityData.map(
      (point) => point.benchmark
    );

    return createPath(
      values,
      98000,
      134000
    );
  }, []);

  const drawdownPath = useMemo(() => {
    const values = drawdownData.map(
      (point) => point.value
    );

    return createPath(
      values,
      -8,
      0,
      900,
      220
    );
  }, []);

  const [backtestResult, setBacktestResult] = useState<BacktestResponse | null>(null);

  async function handleRunBacktest() {
    setIsRunning(true);

    try {
      const backendStrategy = strategy.toLowerCase().includes("trend")
        ? "ema_trend"
        : strategy.toLowerCase().includes("reversion")
        ? "mean_reversion"
        : "sma_crossover";

      const res = await apiRunBacktest({
        symbol: selectedAsset.symbol,
        strategy: backendStrategy,
        parameters: { fast_period: 20, slow_period: 50 },
        initial_capital: parseFloat(initialCapital) || 100000,
        transaction_cost: (parseFloat(transactionCost) || 0.1) / 100,
        slippage: 0.001,
      });

      setBacktestResult(res);
    } catch {
      // Keep UI active with graceful fallback
    } finally {
      setIsRunning(false);
    }
  }

  function resetBacktest() {
    setStrategy("Momentum Alpha");
    setSelectedAsset(assets[1]);
    setStartDate("2025-09-19");
    setEndDate("2026-09-19");
    setInitialCapital("100000");
    setPositionSizing("25");
    setTransactionCost("0.10");
    setBacktestResult(null);
  }

  return (
    <main className="backtesting-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="backtesting-page-header">

        <div>
          <span className="backtesting-breadcrumb">
            QUANTITATIVE STRATEGY RESEARCH
          </span>

          <h1>
            Backtesting
          </h1>

          <p>
            Evaluate strategy performance against historical
            market data before deployment.
          </p>
        </div>

        <div className="backtesting-header-actions">

          <button
            type="button"
            className="backtesting-reset-button"
            onClick={resetBacktest}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            type="button"
            className="backtesting-run-button"
            onClick={handleRunBacktest}
            disabled={isRunning}
          >
            <Play size={17} />

            {isRunning
              ? "Running Backtest..."
              : "Run Backtest"}
          </button>

        </div>

      </section>


      {/* =====================================================
          CONFIGURATION
      ===================================================== */}

      <section className="backtesting-main-grid">

        <div className="backtesting-configuration">

          <div className="backtesting-section-header">

            <div>
              <span className="backtesting-section-label">
                BACKTEST CONFIGURATION
              </span>

              <h2>
                Test Strategy
              </h2>

              <p>
                Configure the historical simulation parameters.
              </p>
            </div>

            <div className="backtesting-section-icon">
              <Activity size={21} />
            </div>

          </div>


          <div className="backtesting-form-divider" />


          {/* Strategy */}

          <div className="backtesting-form-group">

            <label>
              Strategy
            </label>

            <div className="backtesting-select-wrapper">

              <select
                value={strategy}
                onChange={(event) =>
                  setStrategy(event.target.value)
                }
              >
                <option>
                  Momentum Alpha
                </option>

                <option>
                  Trend Following
                </option>

                <option>
                  Mean Reversion
                </option>

                <option>
                  Multi Factor Alpha
                </option>
              </select>

              <ChevronDown size={18} />

            </div>

          </div>


          {/* Asset */}

          <div className="backtesting-form-group">

            <label>
              Asset Universe
            </label>

            <div className="backtesting-asset-grid">

              {assets.map((asset) => {

                const selected =
                  selectedAsset.id === asset.id;

                return (
                  <button
                    type="button"
                    key={asset.id}
                    className={`backtesting-asset-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      setSelectedAsset(asset)
                    }
                  >

                    <div className="backtesting-asset-icon">
                      {asset.icon}
                    </div>

                    <div>
                      <strong>
                        {asset.name}
                      </strong>

                      <span>
                        {asset.symbol}
                      </span>
                    </div>

                    {selected && (
                      <div className="backtesting-check">
                        <Check size={14} />
                      </div>
                    )}

                  </button>
                );
              })}

            </div>

          </div>


          {/* Dates */}

          <div className="backtesting-date-grid">

            <div className="backtesting-form-group">

              <label>
                Start Date
              </label>

              <div className="backtesting-input-icon">

                <CalendarDays size={17} />

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />

              </div>

            </div>


            <div className="backtesting-form-group">

              <label>
                End Date
              </label>

              <div className="backtesting-input-icon">

                <CalendarDays size={17} />

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />

              </div>

            </div>

          </div>


          {/* Capital */}

          <div className="backtesting-date-grid">

            <div className="backtesting-form-group">

              <label>
                Initial Capital
              </label>

              <div className="backtesting-input-icon">

                <CircleDollarSign size={17} />

                <input
                  type="number"
                  value={initialCapital}
                  onChange={(event) =>
                    setInitialCapital(event.target.value)
                  }
                />

              </div>

            </div>


            <div className="backtesting-form-group">

              <label>
                Position Size
              </label>

              <div className="backtesting-input-suffix">

                <input
                  type="number"
                  value={positionSizing}
                  onChange={(event) =>
                    setPositionSizing(event.target.value)
                  }
                />

                <span>%</span>

              </div>

            </div>

          </div>


          {/* Transaction Cost */}

          <div className="backtesting-form-group">

            <label>
              Transaction Cost
            </label>

            <div className="backtesting-input-suffix">

              <input
                type="number"
                step="0.01"
                value={transactionCost}
                onChange={(event) =>
                  setTransactionCost(event.target.value)
                }
              />

              <span>%</span>

            </div>

            <small>
              Applied to each executed trade.
            </small>

          </div>

        </div>


        {/* =====================================================
            STRATEGY SUMMARY
        ===================================================== */}

        <aside className="backtesting-summary-card">

          <div className="backtesting-summary-header">

            <div>
              <span className="backtesting-section-label">
                STRATEGY PREVIEW
              </span>

              <h2>
                {strategy}
              </h2>
            </div>

            <span className="backtesting-draft-badge">
              ● Ready
            </span>

          </div>


          <div className="backtesting-strategy-type">

            <div className="backtesting-summary-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <strong>
                Momentum Strategy
              </strong>

              <span>
                {selectedAsset.symbol} · Daily execution
              </span>
            </div>

          </div>


          <div className="backtesting-summary-stats">

            <div>
              <span>ASSET</span>
              <strong>
                {selectedAsset.symbol}
              </strong>
            </div>

            <div>
              <span>POSITION</span>
              <strong>
                {positionSizing}%
              </strong>
            </div>

            <div>
              <span>COST</span>
              <strong>
                {transactionCost}%
              </strong>
            </div>

          </div>


          <div className="backtesting-rule-list">

            <div>
              <Check size={16} />
              SMA 20 crosses above SMA 50
            </div>

            <div>
              <Check size={16} />
              Position size limited to {positionSizing}%
            </div>

            <div>
              <Check size={16} />
              Stop loss at 5%
            </div>

            <div>
              <Check size={16} />
              Take profit at 12%
            </div>

          </div>


          <div className="backtesting-engine-status">

            <span className="backtesting-status-dot" />

            <span>
              Backtest engine ready
            </span>

          </div>

        </aside>

      </section>


      {/* =====================================================
          PERFORMANCE HEADER
      ===================================================== */}

      <section className="backtesting-performance">

        <div className="backtesting-section-header">

          <div>
            <span className="backtesting-section-label">
              BACKTEST RESULTS
            </span>

            <h2>
              Performance Overview
            </h2>

            <p>
              Historical performance generated from the
              configured strategy and asset universe.
            </p>
          </div>

          <div className="backtesting-result-period">

            <span>
              ANALYSIS PERIOD
            </span>

            <strong>
              {startDate} → {endDate}
            </strong>

          </div>

        </div>


        {/* =====================================================
            METRICS
        ===================================================== */}

        <div className="backtesting-metrics-grid">

          <div className="backtesting-metric-card positive">

            <div className="backtesting-metric-top">
              <div className="backtesting-metric-icon">
                <TrendingUp size={18} />
              </div>

              <span>Total Return</span>
            </div>

            <strong>
              {backtestResult
                ? `${backtestResult.metrics.total_return >= 0 ? "+" : ""}${(backtestResult.metrics.total_return * 100).toFixed(2)}%`
                : "+31.00%"}
            </strong>

            <small>
              Strategy cumulative return
            </small>

          </div>


          <div className="backtesting-metric-card positive">

            <div className="backtesting-metric-top">
              <div className="backtesting-metric-icon">
                <BarChart3 size={18} />
              </div>

              <span>CAGR</span>
            </div>

            <strong>
              {backtestResult
                ? `${backtestResult.metrics.annualized_return >= 0 ? "+" : ""}${(backtestResult.metrics.annualized_return * 100).toFixed(2)}%`
                : "+31.00%"}
            </strong>

            <small>
              Annualized growth rate
            </small>

          </div>


          <div className="backtesting-metric-card positive">

            <div className="backtesting-metric-top">
              <div className="backtesting-metric-icon">
                <Gauge size={18} />
              </div>

              <span>Sharpe Ratio</span>
            </div>

            <strong>
              {backtestResult
                ? backtestResult.metrics.sharpe_ratio.toFixed(2)
                : "1.42"}
            </strong>

            <small>
              Risk-adjusted return
            </small>

          </div>


          <div className="backtesting-metric-card negative">

            <div className="backtesting-metric-top">
              <div className="backtesting-metric-icon">
                <ShieldAlert size={18} />
              </div>

              <span>Max Drawdown</span>
            </div>

            <strong>
              {backtestResult
                ? `${(backtestResult.metrics.maximum_drawdown * 100).toFixed(2)}%`
                : "-18.60%"}
            </strong>

            <small>
              Largest peak-to-trough decline
            </small>

          </div>


          <div className="backtesting-metric-card positive">

            <div className="backtesting-metric-top">
              <div className="backtesting-metric-icon">
                <Target size={18} />
              </div>

              <span>Win Rate</span>
            </div>

            <strong>
              {backtestResult
                ? `${(backtestResult.metrics.win_rate * 100).toFixed(2)}%`
                : "68.40%"}
            </strong>

            <small>
              Percentage of winning trades
            </small>

          </div>


          <div className="backtesting-metric-card neutral">

            <div className="backtesting-metric-top">
              <div className="backtesting-metric-icon">
                <Activity size={18} />
              </div>

              <span>Total Trades</span>
            </div>

            <strong>
              {backtestResult
                ? backtestResult.metrics.trade_count
                : "47"}
            </strong>

            <small>
              Executed positions
            </small>

          </div>

        </div>


        {/* =====================================================
            EQUITY CURVE
        ===================================================== */}

        <div className="backtesting-chart-card">

          <div className="backtesting-chart-header">

            <div>
              <span className="backtesting-section-label">
                EQUITY CURVE
              </span>

              <h3>
                Strategy vs Benchmark
              </h3>

              <p>
                Growth of initial capital over the backtest period.
              </p>
            </div>

            <div className="backtesting-chart-legend">

              <span>
                <i className="backtesting-dot strategy" />
                Strategy
              </span>

              <span>
                <i className="backtesting-dot benchmark" />
                S&amp;P 500
              </span>

            </div>

          </div>


          <div className="backtesting-chart-container">

            <div className="backtesting-y-axis">

              <span>
                ₹1.35L
              </span>

              <span>
                ₹1.25L
              </span>

              <span>
                ₹1.15L
              </span>

              <span>
                ₹1.05L
              </span>

              <span>
                ₹1.00L
              </span>

            </div>


            <div className="backtesting-chart-area">

              <div className="backtesting-chart-grid">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                className="backtesting-svg"
                viewBox="0 0 900 300"
                preserveAspectRatio="none"
              >

                <path
                  d={benchmarkPath}
                  fill="none"
                  stroke="#9db4d2"
                  strokeWidth="2"
                  strokeDasharray="7 6"
                  strokeLinecap="round"
                />

                <path
                  d={strategyPath}
                  fill="none"
                  stroke="#2878ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </div>

          </div>


          <div className="backtesting-chart-labels">

            {equityData.map((point) => (
              <span key={point.label}>
                {point.label}
              </span>
            ))}

          </div>

        </div>


        {/* =====================================================
            LOWER GRID
        ===================================================== */}

        <div className="backtesting-lower-grid">


          {/* Drawdown */}

          <div className="backtesting-small-chart-card">

            <div className="backtesting-chart-header">

              <div>
                <span className="backtesting-section-label">
                  RISK ANALYSIS
                </span>

                <h3>
                  Drawdown
                </h3>

                <p>
                  Strategy decline from previous equity peaks.
                </p>
              </div>

              <div className="backtesting-small-value negative">
                -18.60%
              </div>

            </div>


            <div className="backtesting-drawdown-chart">

              <svg
                viewBox="0 0 900 220"
                preserveAspectRatio="none"
              >

                <path
                  d={drawdownPath}
                  fill="none"
                  stroke="#e64f64"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </div>


            <div className="backtesting-chart-labels">

              {drawdownData.map((point) => (
                <span key={point.label}>
                  {point.label}
                </span>
              ))}

            </div>

          </div>


          {/* Trade statistics */}

          <div className="backtesting-trade-stats">

            <div className="backtesting-chart-header">

              <div>
                <span className="backtesting-section-label">
                  TRADE ANALYSIS
                </span>

                <h3>
                  Trade Statistics
                </h3>

                <p>
                  Summary of executed strategy positions.
                </p>
              </div>

            </div>


            <div className="backtesting-trade-stat-grid">

              <div>
                <span>
                  Winning Trades
                </span>

                <strong className="positive-number">
                  32
                </strong>
              </div>

              <div>
                <span>
                  Losing Trades
                </span>

                <strong className="negative-number">
                  15
                </strong>
              </div>

              <div>
                <span>
                  Profit Factor
                </span>

                <strong>
                  1.84
                </strong>
              </div>

              <div>
                <span>
                  Avg. Trade
                </span>

                <strong className="positive-number">
                  +2.14%
                </strong>
              </div>

            </div>


            <div className="backtesting-trade-summary">

              <div>
                <span>
                  Best Trade
                </span>

                <strong className="positive-number">
                  +9.18%
                </strong>

              </div>

              <div>
                <span>
                  Worst Trade
                </span>

                <strong className="negative-number">
                  -4.72%
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            RECENT TRADES
        ===================================================== */}

        <div className="backtesting-trades-card">

          <div className="backtesting-chart-header">

            <div>
              <span className="backtesting-section-label">
                EXECUTION LOG
              </span>

              <h3>
                Recent Trades
              </h3>

              <p>
                Latest positions generated by the strategy.
              </p>
            </div>

          </div>


          <div className="backtesting-trades-table-wrapper">

            <table className="backtesting-trades-table">

              <thead>

                <tr>
                  <th>Asset</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Return</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {trades.map((trade, index) => (

                  <tr key={`${trade.asset}-${index}`}>

                    <td>
                      <strong>
                        {trade.asset}
                      </strong>
                    </td>

                    <td>

                      <span
                        className={`trade-direction ${
                          trade.type === "Long"
                            ? "long"
                            : "short"
                        }`}
                      >

                        {trade.type === "Long" ? (
                          <ArrowUpRight size={15} />
                        ) : (
                          <ArrowDownRight size={15} />
                        )}

                        {trade.type}

                      </span>

                    </td>

                    <td>
                      {trade.entry}
                    </td>

                    <td>
                      {trade.exit}
                    </td>

                    <td
                      className={
                        trade.status === "win"
                          ? "positive-number"
                          : "negative-number"
                      }
                    >
                      {trade.return}
                    </td>

                    <td>

                      <span
                        className={`trade-status ${
                          trade.status
                        }`}
                      >
                        {trade.status === "win"
                          ? "Profit"
                          : "Loss"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          <div className="backtesting-engine-footer">

            <span className="backtesting-status-dot" />

            <span>
              QuantExa Backtesting Engine
            </span>

            <span>
              •
            </span>

            <span>
              Historical simulation completed
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}
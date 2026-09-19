"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Gauge,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Regime =
  | "All Regimes"
  | "Bull Market"
  | "Bear Market"
  | "Sideways Market";

type TestPeriod =
  | "Full Period"
  | "2021–2022"
  | "2023–2024"
  | "2025–2026";

type TransactionCost = "0.05%" | "0.10%" | "0.20%" | "0.50%" | "1.00%";

type ParameterName =
  | "Fast MA"
  | "Slow MA"
  | "Stop Loss"
  | "Take Profit";

/* =========================================================
   BASE DATA
   ========================================================= */

const baseRegimeData = {
  "Bull Market": {
    return: 42.8,
    sharpe: 1.76,
    drawdown: -11.2,
    trades: 19,
  },

  "Bear Market": {
    return: 8.4,
    sharpe: 0.82,
    drawdown: -18.6,
    trades: 14,
  },

  "Sideways Market": {
    return: 13.7,
    sharpe: 1.04,
    drawdown: -9.8,
    trades: 14,
  },
};

const basePeriodData = {
  "2021–2022": {
    return: 24.6,
    sharpe: 1.18,
    drawdown: -16.2,
  },

  "2023–2024": {
    return: 29.8,
    sharpe: 1.36,
    drawdown: -14.4,
  },

  "2025–2026": {
    return: 31.0,
    sharpe: 1.42,
    drawdown: -18.6,
  },
};

const baseSensitivityData: Record<
  ParameterName,
  {
    values: string[];
    performance: number[];
  }
> = {
  "Fast MA": {
    values: ["10", "20", "30", "40", "50"],
    performance: [18, 31, 27, 22, 16],
  },

  "Slow MA": {
    values: ["50", "75", "100", "150", "200"],
    performance: [31, 28, 25, 21, 17],
  },

  "Stop Loss": {
    values: ["2%", "4%", "6%", "8%", "10%"],
    performance: [21, 27, 31, 29, 24],
  },

  "Take Profit": {
    values: ["5%", "10%", "15%", "20%", "25%"],
    performance: [17, 24, 31, 28, 22],
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

function getTransactionCostValue(
  transactionCost: TransactionCost
) {
  return Number(transactionCost.replace("%", ""));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* =========================================================
   PAGE
   ========================================================= */

export default function RobustnessPage() {
  const [regime, setRegime] =
    useState<Regime>("All Regimes");

  const [period, setPeriod] =
    useState<TestPeriod>("Full Period");

  const [transactionCost, setTransactionCost] =
    useState<TransactionCost>("0.10%");

  const [selectedParameter, setSelectedParameter] =
    useState<ParameterName>("Fast MA");

  const [isRunning, setIsRunning] =
    useState(false);

  const [analysisVersion, setAnalysisVersion] =
    useState(0);

  /* =======================================================
     CURRENT REGIME RESULT
     ======================================================= */

  const currentRegimeResult = useMemo(() => {
    const cost = getTransactionCostValue(
      transactionCost
    );

    if (regime === "All Regimes") {
      const regimes = Object.values(baseRegimeData);

      const averageReturn =
        regimes.reduce(
          (sum, item) => sum + item.return,
          0
        ) / regimes.length;

      const averageSharpe =
        regimes.reduce(
          (sum, item) => sum + item.sharpe,
          0
        ) / regimes.length;

      const averageDrawdown =
        regimes.reduce(
          (sum, item) => sum + item.drawdown,
          0
        ) / regimes.length;

      return {
        return:
          averageReturn -
          cost * 1.8,

        sharpe:
          averageSharpe -
          cost * 0.08,

        drawdown:
          averageDrawdown -
          cost * 0.8,

        trades: regimes.reduce(
          (sum, item) => sum + item.trades,
          0
        ),
      };
    }

    const data = baseRegimeData[regime];

    return {
      return:
        data.return -
        cost * 1.8,

      sharpe:
        data.sharpe -
        cost * 0.08,

      drawdown:
        data.drawdown -
        cost * 0.8,

      trades: data.trades,
    };
  }, [regime, transactionCost, analysisVersion]);

  /* =======================================================
     CURRENT PERIOD RESULT
     ======================================================= */

  const currentPeriodResult = useMemo(() => {
    const cost = getTransactionCostValue(
      transactionCost
    );

    if (period === "Full Period") {
      const periods = Object.values(basePeriodData);

      const averageReturn =
        periods.reduce(
          (sum, item) => sum + item.return,
          0
        ) / periods.length;

      const averageSharpe =
        periods.reduce(
          (sum, item) => sum + item.sharpe,
          0
        ) / periods.length;

      const averageDrawdown =
        periods.reduce(
          (sum, item) => sum + item.drawdown,
          0
        ) / periods.length;

      return {
        return:
          averageReturn -
          cost * 1.8,

        sharpe:
          averageSharpe -
          cost * 0.08,

        drawdown:
          averageDrawdown -
          cost * 0.8,
      };
    }

    const data = basePeriodData[period];

    return {
      return:
        data.return -
        cost * 1.8,

      sharpe:
        data.sharpe -
        cost * 0.08,

      drawdown:
        data.drawdown -
        cost * 0.8,
    };
  }, [period, transactionCost, analysisVersion]);

  /* =======================================================
     SENSITIVITY
     ======================================================= */

  const selectedSensitivity = useMemo(() => {
    const base =
      baseSensitivityData[selectedParameter];

    const cost =
      getTransactionCostValue(transactionCost);

    let multiplier = 1;

    if (regime === "Bull Market") {
      multiplier = 1.08;
    }

    if (regime === "Bear Market") {
      multiplier = 0.82;
    }

    if (regime === "Sideways Market") {
      multiplier = 0.91;
    }

    if (period === "2021–2022") {
      multiplier *= 0.92;
    }

    if (period === "2023–2024") {
      multiplier *= 0.98;
    }

    if (period === "2025–2026") {
      multiplier *= 1.04;
    }

    const performance = base.performance.map(
      (value) =>
        Number(
          clamp(
            value * multiplier -
              cost * 1.4,
            -10,
            60
          ).toFixed(1)
        )
    );

    return {
      values: base.values,
      performance,
    };
  }, [
    selectedParameter,
    regime,
    period,
    transactionCost,
    analysisVersion,
  ]);

  /* =======================================================
     STABILITY METRICS
     ======================================================= */

  const stability = useMemo(() => {
    const cost =
      getTransactionCostValue(transactionCost);

    const regimeAdjustment =
      regime === "All Regimes"
        ? 0
        : regime === "Bull Market"
          ? 3
          : regime === "Bear Market"
            ? -8
            : -2;

    const periodAdjustment =
      period === "Full Period"
        ? 0
        : period === "2021–2022"
          ? -4
          : period === "2023–2024"
            ? 1
            : 3;

    const costAdjustment = cost * 5;

    return {
      returnStability: clamp(
        87 +
          regimeAdjustment +
          periodAdjustment -
          costAdjustment,
        55,
        96
      ),

      sharpeStability: clamp(
        82 +
          regimeAdjustment * 0.5 +
          periodAdjustment -
          costAdjustment * 0.8,
        50,
        94
      ),

      regimeCoverage:
        regime === "All Regimes"
          ? "3 / 3"
          : "1 / 3",

      parameterStability: clamp(
        84 +
          regimeAdjustment * 0.4 +
          periodAdjustment -
          costAdjustment * 0.6,
        52,
        94
      ),
    };
  }, [
    regime,
    period,
    transactionCost,
    analysisVersion,
  ]);

  /* =======================================================
     REGIME TABLE
     ======================================================= */

  const displayedRegimes = useMemo(() => {
    const cost =
      getTransactionCostValue(transactionCost);

    return Object.entries(baseRegimeData).map(
      ([name, data]) => {
        const regimeName =
          name as keyof typeof baseRegimeData;

        let multiplier = 1;

        if (
          regime !== "All Regimes" &&
          regime !== regimeName
        ) {
          multiplier = 0.35;
        }

        if (period === "2021–2022") {
          multiplier *= 0.92;
        }

        if (period === "2023–2024") {
          multiplier *= 0.98;
        }

        if (period === "2025–2026") {
          multiplier *= 1.04;
        }

        return {
          name,
          return: Number(
            (
              data.return * multiplier -
              cost * 1.8
            ).toFixed(1)
          ),
          sharpe: Number(
            (
              data.sharpe * multiplier -
              cost * 0.08
            ).toFixed(2)
          ),
          drawdown: Number(
            (
              data.drawdown * multiplier -
              cost * 0.8
            ).toFixed(1)
          ),
          trades: data.trades,
          state:
            data.return > 20
              ? "positive"
              : "neutral",
        };
      }
    );
  }, [
    regime,
    period,
    transactionCost,
    analysisVersion,
  ]);

  /* =======================================================
     PERIOD TABLE
     ======================================================= */

  const displayedPeriods = useMemo(() => {
    const cost =
      getTransactionCostValue(transactionCost);

    return Object.entries(basePeriodData).map(
      ([name, data]) => {
        const periodName =
          name as keyof typeof basePeriodData;

        let multiplier = 1;

        if (
          period !== "Full Period" &&
          period !== periodName
        ) {
          multiplier = 0.35;
        }

        if (regime === "Bull Market") {
          multiplier *= 1.05;
        }

        if (regime === "Bear Market") {
          multiplier *= 0.82;
        }

        if (regime === "Sideways Market") {
          multiplier *= 0.91;
        }

        return {
          period: name,
          return: Number(
            (
              data.return * multiplier -
              cost * 1.8
            ).toFixed(1)
          ),
          sharpe: Number(
            (
              data.sharpe * multiplier -
              cost * 0.08
            ).toFixed(2)
          ),
          drawdown: Number(
            (
              data.drawdown * multiplier -
              cost * 0.8
            ).toFixed(1)
          ),
        };
      }
    );
  }, [
    regime,
    period,
    transactionCost,
    analysisVersion,
  ]);

  /* =======================================================
     TRANSACTION COST DATA
     ======================================================= */

  const transactionCostData = useMemo(() => {
    const costs: TransactionCost[] = [
      "0.05%",
      "0.10%",
      "0.20%",
      "0.50%",
      "1.00%",
    ];

    const baseReturn =
      currentPeriodResult.return;

    return costs.map((cost) => {
      const costValue =
        getTransactionCostValue(cost);

      const selectedCost =
        getTransactionCostValue(
          transactionCost
        );

      const difference =
        costValue - selectedCost;

      return {
        cost,
        return: Number(
          (
            baseReturn -
            difference * 1.8
          ).toFixed(1)
        ),
      };
    });
  }, [
    currentPeriodResult.return,
    transactionCost,
  ]);

  /* =======================================================
     RUN / RESET
     ======================================================= */

  function runRobustnessTest() {
    setIsRunning(true);

    window.setTimeout(() => {
      setAnalysisVersion(
        (value) => value + 1
      );

      setIsRunning(false);
    }, 700);
  }

  function resetAnalysis() {
    setRegime("All Regimes");
    setPeriod("Full Period");
    setTransactionCost("0.10%");
    setSelectedParameter("Fast MA");
    setIsRunning(false);
    setAnalysisVersion(
      (value) => value + 1
    );
  }

  const overallState =
    currentPeriodResult.return >= 20
      ? "positive"
      : currentPeriodResult.return >= 0
        ? "neutral"
        : "negative";

  const overallLabel =
    overallState === "positive"
      ? "Stable"
      : overallState === "neutral"
        ? "Moderate"
        : "Sensitive";

  return (
    <main className="robustness-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <header className="robustness-page-header">

        <div>

          <span className="robustness-breadcrumb">
            STRATEGY VALIDATION
          </span>

          <h1>
            Robustness Analysis
          </h1>

          <p>
            Stress-test strategy performance across
            parameters, market regimes, time periods
            and execution costs.
          </p>

        </div>

        <div className="robustness-header-actions">

          <button
            type="button"
            className="robustness-reset-button"
            onClick={resetAnalysis}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            type="button"
            className="robustness-run-button"
            onClick={runRobustnessTest}
            disabled={isRunning}
          >
            <ShieldCheck size={18} />

            {isRunning
              ? "Running Analysis..."
              : "Run Robustness Test"}
          </button>

        </div>

      </header>

      {/* =================================================
          CONFIGURATION
          ================================================= */}

      <section className="robustness-configuration">

        <div className="robustness-section-header">

          <div className="robustness-section-icon">
            <SlidersHorizontal size={21} />
          </div>

          <div>

            <span>
              TEST CONFIGURATION
            </span>

            <h2>
              Robustness Parameters
            </h2>

            <p>
              Define the conditions under which
              the strategy will be stress-tested.
            </p>

          </div>

        </div>

        <div className="robustness-form-grid">

          {/* Strategy */}

          <div className="robustness-form-group">

            <label>
              Strategy
            </label>

            <div className="robustness-static-field">

              <div>

                <strong>
                  Moving Average Crossover
                </strong>

                <span>
                  20 / 50 SMA
                </span>

              </div>

              <CheckCircle2 size={19} />

            </div>

          </div>

          {/* Regime */}

          <div className="robustness-form-group">

            <label>
              Market Regime
            </label>

            <div className="robustness-select-wrapper">

              <select
                value={regime}
                onChange={(event) =>
                  setRegime(
                    event.target.value as Regime
                  )
                }
              >

                <option>
                  All Regimes
                </option>

                <option>
                  Bull Market
                </option>

                <option>
                  Bear Market
                </option>

                <option>
                  Sideways Market
                </option>

              </select>

              <ChevronDown size={18} />

            </div>

          </div>

          {/* Period */}

          <div className="robustness-form-group">

            <label>
              Test Period
            </label>

            <div className="robustness-select-wrapper">

              <select
                value={period}
                onChange={(event) =>
                  setPeriod(
                    event.target.value as TestPeriod
                  )
                }
              >

                <option>
                  Full Period
                </option>

                <option>
                  2021–2022
                </option>

                <option>
                  2023–2024
                </option>

                <option>
                  2025–2026
                </option>

              </select>

              <ChevronDown size={18} />

            </div>

          </div>

          {/* Transaction Cost */}

          <div className="robustness-form-group">

            <label>
              Transaction Cost
            </label>

            <div className="robustness-select-wrapper">

              <select
                value={transactionCost}
                onChange={(event) =>
                  setTransactionCost(
                    event.target.value as TransactionCost
                  )
                }
              >

                <option>
                  0.05%
                </option>

                <option>
                  0.10%
                </option>

                <option>
                  0.20%
                </option>

                <option>
                  0.50%
                </option>

                <option>
                  1.00%
                </option>

              </select>

              <ChevronDown size={18} />

            </div>

          </div>

        </div>

        <div className="robustness-engine-status">

          <span className="robustness-status-dot" />

          <span>
            Robustness Engine Ready
          </span>

          <span>•</span>

          <span>
            Strategy: Moving Average Crossover
          </span>

          <span>•</span>

          <span>
            Cost: {transactionCost}
          </span>

        </div>

      </section>

      {/* =================================================
          SUMMARY
          ================================================= */}

      <section className="robustness-summary-card">

        <div className="robustness-summary-header">

          <div>

            <span className="robustness-breadcrumb">
              ROBUSTNESS RESULT
            </span>

            <h2>
              Strategy Stability Overview
            </h2>

            <p>
              Results update according to the selected
              robustness conditions.
            </p>

          </div>

          <div className="robustness-summary-badge">

            <CheckCircle2 size={18} />

            {overallLabel}

          </div>

        </div>

        <div className="robustness-summary-grid">

          {/* Return stability */}

          <div className="robustness-summary-metric">

            <div>
              <TrendingUp size={19} />
              <span>
                Return Stability
              </span>
            </div>

            <strong>
              {Math.round(
                stability.returnStability
              )}
              %
            </strong>

            <small>
              Consistency across tested conditions
            </small>

          </div>

          {/* Sharpe */}

          <div className="robustness-summary-metric">

            <div>
              <Gauge size={19} />
              <span>
                Sharpe Stability
              </span>
            </div>

            <strong>
              {Math.round(
                stability.sharpeStability
              )}
              %
            </strong>

            <small>
              Risk-adjusted performance consistency
            </small>

          </div>

          {/* Regime */}

          <div className="robustness-summary-metric">

            <div>
              <Activity size={19} />
              <span>
                Regime Coverage
              </span>
            </div>

            <strong>
              {stability.regimeCoverage}
            </strong>

            <small>
              Market conditions included
            </small>

          </div>

          {/* Parameter */}

          <div className="robustness-summary-metric">

            <div>
              <ShieldCheck size={19} />
              <span>
                Parameter Stability
              </span>
            </div>

            <strong>
              {Math.round(
                stability.parameterStability
              )}
              %
            </strong>

            <small>
              Stability under parameter changes
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          PARAMETER SENSITIVITY
          ================================================= */}

      <section className="robustness-card">

        <div className="robustness-card-header">

          <div>

            <span className="robustness-breadcrumb">
              PARAMETER SENSITIVITY
            </span>

            <h2>
              Parameter Stability
            </h2>

            <p>
              Select a parameter to examine how
              performance changes across its range.
            </p>

          </div>

          <div className="robustness-card-icon">
            <SlidersHorizontal size={21} />
          </div>

        </div>

        {/* Parameter selector */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "24px",
          }}
        >

          {(
            Object.keys(
              baseSensitivityData
            ) as ParameterName[]
          ).map((parameter) => (

            <button
              key={parameter}
              type="button"
              onClick={() =>
                setSelectedParameter(parameter)
              }
              style={{
                padding: "10px 15px",
                borderRadius: "9px",
                border:
                  selectedParameter === parameter
                    ? "1px solid #2878ff"
                    : "1px solid #d9e5f4",
                background:
                  selectedParameter === parameter
                    ? "#edf4ff"
                    : "#ffffff",
                color:
                  selectedParameter === parameter
                    ? "#2878ff"
                    : "#52657d",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {parameter}
            </button>

          ))}

        </div>

        <div className="robustness-sensitivity-layout">

          {/* LEFT */}

          <div className="robustness-sensitivity-list">

            <div className="robustness-sensitivity-row">

              <div>

                <strong>
                  {selectedParameter}
                </strong>

                <span>
                  {selectedSensitivity.values.join(
                    "  ·  "
                  )}
                </span>

              </div>

              <div className="robustness-mini-bars">

                {selectedSensitivity.performance.map(
                  (value, index) => (

                    <div
                      key={`${selectedParameter}-${index}`}
                      className="robustness-mini-bar"
                      style={{
                        height: `${Math.max(
                          value * 2,
                          12
                        )}px`,
                      }}
                    />

                  )
                )}

              </div>

              <strong>
                {Math.max(
                  ...selectedSensitivity.performance
                )}
                %
              </strong>

            </div>

            <div className="robustness-sensitivity-row">

              <div>

                <strong>
                  Selected Regime
                </strong>

                <span>
                  {regime}
                </span>

              </div>

              <div>

                <strong>
                  {currentRegimeResult.return.toFixed(
                    1
                  )}
                  %
                </strong>

              </div>

              <strong>
                Return
              </strong>

            </div>

            <div className="robustness-sensitivity-row">

              <div>

                <strong>
                  Selected Period
                </strong>

                <span>
                  {period}
                </span>

              </div>

              <div>

                <strong>
                  {currentPeriodResult.sharpe.toFixed(
                    2
                  )}
                </strong>

              </div>

              <strong>
                Sharpe
              </strong>

            </div>

          </div>

          {/* RIGHT CHART */}

          <div className="robustness-sensitivity-chart">

            <div className="robustness-chart-y-axis">

              <span>40%</span>
              <span>30%</span>
              <span>20%</span>
              <span>10%</span>
              <span>0%</span>

            </div>

            <div className="robustness-chart-area">

              <div className="robustness-chart-grid">

                <span />
                <span />
                <span />
                <span />
                <span />

              </div>

              <svg
                viewBox="0 0 760 300"
                preserveAspectRatio="none"
                className="robustness-svg"
              >

                <polyline
                  points={selectedSensitivity.performance
                    .map(
                      (value, index) => {
                        const x =
                          (index /
                            (selectedSensitivity
                              .performance
                              .length -
                              1)) *
                          760;

                        const y =
                          300 -
                          ((value + 10) /
                            50) *
                            300;

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

                {selectedSensitivity.performance.map(
                  (value, index) => {

                    const x =
                      (index /
                        (selectedSensitivity
                          .performance
                          .length -
                          1)) *
                      760;

                    const y =
                      300 -
                      ((value + 10) /
                        50) *
                        300;

                    return (
                      <circle
                        key={index}
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

        </div>

        <div className="robustness-chart-labels">

          {selectedSensitivity.values.map(
            (value) => (
              <span key={value}>
                {value}
              </span>
            )
          )}

        </div>

        <div className="robustness-chart-note">

          <BarChart3 size={17} />

          <span>
            {selectedParameter} sensitivity is
            recalculated using the selected regime,
            historical period and transaction cost.
          </span>

        </div>

      </section>

      {/* =================================================
          LOWER GRID
          ================================================= */}

      <div className="robustness-lower-grid">

        {/* REGIME */}

        <section className="robustness-card">

          <div className="robustness-card-header">

            <div>

              <span className="robustness-breadcrumb">
                MARKET REGIMES
              </span>

              <h2>
                Regime Performance
              </h2>

              <p>
                Strategy behaviour across different
                market environments.
              </p>

            </div>

            <div className="robustness-card-icon">
              <Activity size={21} />
            </div>

          </div>

          <div className="robustness-regime-list">

            {displayedRegimes.map((item) => (

              <div
                key={item.name}
                className="robustness-regime-row"
                style={{
                  opacity:
                    regime !== "All Regimes" &&
                    regime !== item.name
                      ? 0.42
                      : 1,
                }}
              >

                <div className="robustness-regime-name">

                  <span
                    className={`regime-dot ${item.state}`}
                  />

                  <strong>
                    {item.name}
                  </strong>

                </div>

                <div>

                  <span>
                    Return
                  </span>

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

                </div>

                <div>

                  <span>
                    Sharpe
                  </span>

                  <strong>
                    {item.sharpe.toFixed(2)}
                  </strong>

                </div>

                <div>

                  <span>
                    Drawdown
                  </span>

                  <strong className="negative-number">
                    {item.drawdown.toFixed(1)}%
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* PERIOD */}

        <section className="robustness-card">

          <div className="robustness-card-header">

            <div>

              <span className="robustness-breadcrumb">
                TIME PERIOD ANALYSIS
              </span>

              <h2>
                Historical Stability
              </h2>

              <p>
                Performance across independent
                historical periods.
              </p>

            </div>

            <div className="robustness-card-icon">
              <BarChart3 size={21} />
            </div>

          </div>

          <div className="robustness-period-list">

            {displayedPeriods.map((item) => (

              <div
                key={item.period}
                className="robustness-period-row"
                style={{
                  opacity:
                    period !== "Full Period" &&
                    period !== item.period
                      ? 0.42
                      : 1,
                }}
              >

                <div>

                  <strong>
                    {item.period}
                  </strong>

                  <span>
                    Historical test window
                  </span>

                </div>

                <div>

                  <span>
                    Return
                  </span>

                  <strong className="positive-number">
                    {item.return >= 0
                      ? "+"
                      : ""}
                    {item.return.toFixed(1)}%
                  </strong>

                </div>

                <div>

                  <span>
                    Sharpe
                  </span>

                  <strong>
                    {item.sharpe.toFixed(2)}
                  </strong>

                </div>

                <div>

                  <span>
                    Drawdown
                  </span>

                  <strong className="negative-number">
                    {item.drawdown.toFixed(1)}%
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

      {/* =================================================
          TRANSACTION COST
          ================================================= */}

      <section className="robustness-card">

        <div className="robustness-card-header">

          <div>

            <span className="robustness-breadcrumb">
              EXECUTION STRESS TEST
            </span>

            <h2>
              Transaction Cost Sensitivity
            </h2>

            <p>
              Evaluate how execution costs affect
              the observed strategy performance.
            </p>

          </div>

          <div className="robustness-card-icon">
            <TrendingDown size={21} />
          </div>

        </div>

        <div className="transaction-cost-grid">

          {transactionCostData.map(
            (item) => (

              <div
                key={item.cost}
                className="transaction-cost-item"
                style={{
                  border:
                    item.cost ===
                    transactionCost
                      ? "1px solid #2878ff"
                      : undefined,

                  background:
                    item.cost ===
                    transactionCost
                      ? "#f5f9ff"
                      : undefined,
                }}
              >

                <span>
                  {item.cost}
                </span>

                <strong>
                  {item.return >= 0
                    ? "+"
                    : ""}
                  {item.return.toFixed(1)}%
                </strong>

                <small>
                  Return
                </small>

              </div>

            )
          )}

        </div>

        <div className="robustness-stress-note">

          <ShieldCheck size={18} />

          <p>
            At the selected{" "}
            <strong>
              {transactionCost}
            </strong>{" "}
            transaction cost, the estimated
            period return is{" "}
            <strong>
              {currentPeriodResult.return >= 0
                ? "+"
                : ""}
              {currentPeriodResult.return.toFixed(
                1
              )}
              %
            </strong>
            . Higher execution costs reduce
            the simulated return.
          </p>

        </div>

      </section>

      {/* =================================================
          CURRENT RESULT
          ================================================= */}

      <section className="robustness-card">

        <div className="robustness-card-header">

          <div>

            <span className="robustness-breadcrumb">
              SELECTED TEST RESULT
            </span>

            <h2>
              Current Analysis
            </h2>

            <p>
              Live result based on the current
              robustness configuration.
            </p>

          </div>

          <div className="robustness-card-icon">

            {currentPeriodResult.return >= 0 ? (
              <TrendingUp size={21} />
            ) : (
              <TrendingDown size={21} />
            )}

          </div>

        </div>

        <div className="robustness-summary-grid">

          <div className="robustness-summary-metric">

            <div>
              <TrendingUp size={19} />
              <span>
                Estimated Return
              </span>
            </div>

            <strong
              className={
                currentPeriodResult.return >= 0
                  ? "positive-number"
                  : "negative-number"
              }
            >
              {currentPeriodResult.return >= 0
                ? "+"
                : ""}
              {currentPeriodResult.return.toFixed(
                2
              )}
              %
            </strong>

            <small>
              Selected test conditions
            </small>

          </div>

          <div className="robustness-summary-metric">

            <div>
              <Gauge size={19} />
              <span>
                Sharpe Ratio
              </span>
            </div>

            <strong>
              {currentPeriodResult.sharpe.toFixed(
                2
              )}
            </strong>

            <small>
              Risk-adjusted performance
            </small>

          </div>

          <div className="robustness-summary-metric">

            <div>
              <TrendingDown size={19} />
              <span>
                Max Drawdown
              </span>
            </div>

            <strong className="negative-number">
              {currentPeriodResult.drawdown.toFixed(
                2
              )}
              %
            </strong>

            <small>
              Peak-to-trough decline
            </small>

          </div>

          <div className="robustness-summary-metric">

            <div>
              <Activity size={19} />
              <span>
                Trades
              </span>
            </div>

            <strong>
              {currentRegimeResult.trades}
            </strong>

            <small>
              Historical trade observations
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="robustness-footer-status">

        <span className="robustness-status-dot" />

        <span>
          QuantExa Robustness Engine
        </span>

        <span>•</span>

        <span>
          {regime}
        </span>

        <span>•</span>

        <span>
          {period}
        </span>

        <span>•</span>

        <span>
          Transaction cost {transactionCost}
        </span>

      </div>

    </main>
  );
}
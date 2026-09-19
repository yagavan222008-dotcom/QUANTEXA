"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Asset } from "@/types/market";

import {
  getIntelligenceAnalysis,
} from "@/lib/mockAnalysis";

type QuantExaIntelligenceProps = {
  asset: Asset;
  startDate: string;
  endDate: string;
};

type SignalState =
  | "positive"
  | "negative"
  | "neutral";

/* =========================================================
   STATE HELPERS
========================================================= */

function getState(
  value: string
): SignalState {
  if (
    value === "Bullish" ||
    value === "Strong" ||
    value === "Low"
  ) {
    return "positive";
  }

  if (
    value === "Bearish" ||
    value === "Weak" ||
    value === "High" ||
    value === "Overbought" ||
    value === "Oversold"
  ) {
    return "negative";
  }

  return "neutral";
}

/* =========================================================
   ICON HELPER
========================================================= */

function getIcon(
  label: string,
  value: string
) {
  if (label === "Trend") {
    return value === "Bearish"
      ? <TrendingDown size={18} />
      : <TrendingUp size={18} />;
  }

  if (label === "Momentum") {
    return <Activity size={18} />;
  }

  if (label === "Risk Level") {
    return <ShieldAlert size={18} />;
  }

  if (label === "Moving Average") {
    return <Gauge size={18} />;
  }

  return value === "Oversold"
    ? <ArrowDownRight size={18} />
    : <ArrowUpRight size={18} />;
}

/* =========================================================
   DESCRIPTION HELPER
========================================================= */

function getDescription(
  label: string,
  value: string
) {
  if (label === "Trend") {
    if (value === "Bullish") {
      return "Price structure remains upward biased.";
    }

    if (value === "Bearish") {
      return "Price structure remains downward biased.";
    }

    return "Price structure remains relatively balanced.";
  }

  if (label === "Momentum") {
    if (value === "Strong") {
      return "Recent price movement shows strong momentum.";
    }

    if (value === "Weak") {
      return "Recent price momentum appears to be weakening.";
    }

    return "Momentum remains moderate across the period.";
  }

  if (label === "Risk Level") {
    if (value === "High") {
      return "Elevated volatility requires closer risk monitoring.";
    }

    if (value === "Low") {
      return "Price behaviour indicates relatively contained risk.";
    }

    return "Volatility indicates a moderate risk environment.";
  }

  if (label === "Moving Average") {
    if (value === "Bullish") {
      return "Price remains above key moving-average levels.";
    }

    if (value === "Bearish") {
      return "Price remains below key moving-average levels.";
    }

    return "Price is trading around key moving-average levels.";
  }

  if (value === "Overbought") {
    return "Momentum is elevated and may require caution.";
  }

  if (value === "Oversold") {
    return "Momentum is weak and selling pressure is elevated.";
  }

  return "Momentum remains within a neutral range.";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function QuantExaIntelligence({
  asset,
  startDate,
  endDate,
}: QuantExaIntelligenceProps) {

  /*
   * Intelligence is now derived from the same
   * central quantitative + technical analysis engine.
   */
  const data = getIntelligenceAnalysis(
    asset,
    startDate,
    endDate
  );

  const signals = [
    {
      label: "Trend",
      value: data.trend,
    },
    {
      label: "Momentum",
      value: data.momentum,
    },
    {
      label: "Risk Level",
      value: data.risk,
    },
    {
      label: "Moving Average",
      value: data.movingAverage,
    },
    {
      label: "RSI Signal",
      value: data.rsi,
    },
  ];

  const positiveSignals =
    signals.filter(
      (signal) =>
        getState(signal.value) ===
        "positive"
    ).length;

  const negativeSignals =
    signals.filter(
      (signal) =>
        getState(signal.value) ===
        "negative"
    ).length;

  let overallState: SignalState =
    "neutral";

  if (
    positiveSignals >
    negativeSignals
  ) {
    overallState = "positive";
  } else if (
    negativeSignals >
    positiveSignals
  ) {
    overallState = "negative";
  }

  const overallText =
    overallState === "positive"
      ? "constructive"
      : overallState === "negative"
        ? "cautious"
        : "mixed";

  return (
    <section className="quantexa-intelligence">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="quantexa-intelligence-header">

        <div>

          <span className="asset-breadcrumb">
            QUANTEXA INTELLIGENCE
          </span>

          <h2>
            Quantitative Intelligence
          </h2>

          <p>
            Interpreted quantitative signals for{" "}
            <strong>
              {asset.name}
            </strong>{" "}
            across the selected analysis period.
          </p>

        </div>

        <div className="intelligence-period">

          <span>
            ANALYSIS PERIOD
          </span>

          <strong>
            {startDate} → {endDate}
          </strong>

        </div>

      </div>

      {/* =================================================
          SIGNAL CARDS
      ================================================= */}

      <div className="intelligence-signal-grid">

        {signals.map((signal) => {

          const state =
            getState(signal.value);

          return (
            <div
              key={signal.label}
              className={`intelligence-signal-card ${state}`}
            >

              <div className="intelligence-signal-top">

                <div className="intelligence-signal-icon">
                  {getIcon(
                    signal.label,
                    signal.value
                  )}
                </div>

                <span>
                  {signal.label}
                </span>

              </div>

              <strong className="intelligence-signal-value">
                {signal.value}
              </strong>

              <p>
                {getDescription(
                  signal.label,
                  signal.value
                )}
              </p>

            </div>
          );
        })}

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        className={`intelligence-summary ${overallState}`}
      >

        <div className="intelligence-summary-header">

          <div className="intelligence-summary-icon">

            {overallState === "negative" ? (
              <TrendingDown size={20} />
            ) : (
              <TrendingUp size={20} />
            )}

          </div>

          <div>

            <span>
              QUANTITATIVE INTERPRETATION
            </span>

            <h3>
              {asset.name} currently shows a{" "}
              {overallText} technical structure.
            </h3>

          </div>

        </div>

        <p className="intelligence-summary-text">

          The selected analysis period indicates
          a{" "}
          <strong>
            {data.trend.toLowerCase()}
          </strong>{" "}
          trend with{" "}
          <strong>
            {data.momentum.toLowerCase()} momentum
          </strong>
          . The current risk classification is{" "}
          <strong>
            {data.risk.toLowerCase()}
          </strong>
          , while the moving-average structure
          is{" "}
          <strong>
            {data.movingAverage.toLowerCase()}
          </strong>
          .

        </p>

        {/* =================================================
            OBSERVATIONS
        ================================================= */}

        <div className="intelligence-observations">

          <div>

            <span className="observation-dot positive" />

            <p>
              Trend signal:{" "}
              <strong>
                {data.trend}
              </strong>
            </p>

          </div>

          <div>

            <span className="observation-dot neutral" />

            <p>
              Risk profile:{" "}
              <strong>
                {data.risk}
              </strong>
            </p>

          </div>

          <div>

            <span className="observation-dot negative" />

            <p>
              RSI condition:{" "}
              <strong>
                {data.rsi}
              </strong>
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          ENGINE STATUS
      ================================================= */}

      <div className="intelligence-engine-status">

        <span className="intelligence-status-dot" />

        <span>
          QuantExa Intelligence Engine
        </span>

        <span className="intelligence-separator">
          •
        </span>

        <span>
          Analysis generated for{" "}
          {asset.symbol}
        </span>

      </div>

    </section>
  );
}
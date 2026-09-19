"use client";

import {
  Activity,
  BarChart3,
  Gauge,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { Asset } from "@/types/market";
import { getQuantitativeAnalysis } from "@/lib/mockAnalysis";

type QuantitativeMetricsProps = {
  asset: Asset;
  startDate: string;
  endDate: string;
};

type Metric = {
  title: string;
  value: string;
  description: string;
  type: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
};

export default function QuantitativeMetrics({
  asset,
  startDate,
  endDate,
}: QuantitativeMetricsProps) {
  /*
   * All quantitative values now come from the
   * central QuantExa mock analysis engine.
   *
   * The analysis responds to:
   * - selected asset
   * - selected start date
   * - selected end date
   */
  const metrics = getQuantitativeAnalysis(
    asset,
    startDate,
    endDate
  );

  const metricCards: Metric[] = [
    {
      title: "Returns",

      value: `${metrics.returns >= 0 ? "+" : ""}${metrics.returns.toFixed(2)}%`,

      description:
        "Total return over the selected period",

      type:
        metrics.returns >= 0
          ? "positive"
          : "negative",

      icon: <TrendingUp size={18} />,
    },

    {
      title: "Volatility",

      value: `${metrics.volatility.toFixed(2)}%`,

      description:
        "Annualized price volatility",

      type: "neutral",

      icon: <Activity size={18} />,
    },

    {
      title: "Sharpe Ratio",

      value: metrics.sharpe.toFixed(2),

      description:
        "Risk-adjusted return measure",

      type:
        metrics.sharpe >= 1
          ? "positive"
          : metrics.sharpe < 0
            ? "negative"
            : "neutral",

      icon: <Gauge size={18} />,
    },

    {
      title: "Max Drawdown",

      value: `${metrics.maxDrawdown.toFixed(2)}%`,

      description:
        "Largest peak-to-trough decline",

      type: "negative",

      icon: <ShieldAlert size={18} />,
    },

    {
      title: "Correlation",

      value: metrics.correlation.toFixed(2),

      description:
        "Correlation with S&P 500",

      type: "neutral",

      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <section className="quantitative-metrics">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="quantitative-metrics-header">

        <div>

          <span className="asset-breadcrumb">
            QUANTITATIVE ANALYSIS
          </span>

          <h2>
            Risk & Performance Metrics
          </h2>

          <p>
            Quantitative measurements for{" "}
            <strong>
              {asset.name}
            </strong>{" "}
            across the selected analysis period.
          </p>

        </div>

        <div className="metrics-period">

          <span>
            Analysis Period
          </span>

          <strong>
            {startDate} → {endDate}
          </strong>

        </div>

      </div>


      {/* =================================================
          METRIC GRID
      ================================================= */}

      <div className="quantitative-metrics-grid">

        {metricCards.map((metric) => (

          <div
            key={metric.title}
            className={`quantitative-metric-card ${metric.type}`}
          >

            <div className="quantitative-metric-top">

              <div className="quantitative-metric-icon">
                {metric.icon}
              </div>

              <span>
                {metric.title}
              </span>

            </div>

            <strong className="quantitative-metric-value">
              {metric.value}
            </strong>

            <span className="quantitative-metric-description">
              {metric.description}
            </span>

          </div>

        ))}

      </div>


      {/* =================================================
          ENGINE STATUS
      ================================================= */}

      <div className="quantitative-engine-status">

        <div className="metric-legend-item">
          <span className="metric-legend-dot green" />
          <span>
            Positive / favorable
          </span>
        </div>

        <span className="metric-legend-separator">
          •
        </span>

        <div className="metric-legend-item">
          <span className="metric-legend-dot amber" />
          <span>
            Risk / variability
          </span>
        </div>

        <span className="metric-legend-separator">
          •
        </span>

        <div className="metric-legend-item">
          <span className="metric-legend-dot red" />
          <span>
            Negative / downside
          </span>
        </div>

        <span className="metric-legend-separator">
          •
        </span>

        <div className="metric-legend-item">
          <span className="metric-legend-dot blue" />
          <span>
            Neutral / relationship
          </span>
        </div>

        <span className="metric-legend-separator">
          •
        </span>

        <span className="engine-source">
          QuantExa Quantitative Engine
        </span>

      </div>

    </section>
  );
}
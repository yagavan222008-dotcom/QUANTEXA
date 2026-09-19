"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Gauge,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { Asset } from "@/types/market";
import { getQuantitativeAnalysis } from "@/lib/mockAnalysis";
import { getRiskMetrics, RiskMetricsResponse } from "@/lib/api";

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
  const [apiMetrics, setApiMetrics] = useState<RiskMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getRiskMetrics(asset.symbol)
      .then((data) => {
        if (isMounted) {
          setApiMetrics(data);
          setIsLive(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLive(false);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [asset.symbol, startDate, endDate]);

  const fallbackMetrics = getQuantitativeAnalysis(asset, startDate, endDate);

  const returns = isLive && apiMetrics?.annualized_return != null
    ? apiMetrics.annualized_return
    : fallbackMetrics.returns;

  const volatility = isLive && apiMetrics?.annualized_volatility != null
    ? apiMetrics.annualized_volatility
    : fallbackMetrics.volatility;

  const sharpe = isLive && apiMetrics?.sharpe_ratio != null
    ? apiMetrics.sharpe_ratio
    : fallbackMetrics.sharpe;

  const maxDrawdown = isLive && apiMetrics?.max_drawdown != null
    ? apiMetrics.max_drawdown
    : fallbackMetrics.maxDrawdown;

  const correlation = fallbackMetrics.correlation;

  const metricCards: Metric[] = [
    {
      title: "Returns",
      value: `${returns >= 0 ? "+" : ""}${returns.toFixed(2)}%`,
      description: "Total return over the selected period",
      type: returns >= 0 ? "positive" : "negative",
      icon: <TrendingUp size={18} />,
    },
    {
      title: "Volatility",
      value: `${volatility.toFixed(2)}%`,
      description: "Annualized price volatility",
      type: "neutral",
      icon: <Activity size={18} />,
    },
    {
      title: "Sharpe Ratio",
      value: sharpe.toFixed(2),
      description: "Risk-adjusted return measure",
      type: sharpe >= 1 ? "positive" : sharpe < 0 ? "negative" : "neutral",
      icon: <Gauge size={18} />,
    },
    {
      title: "Max Drawdown",
      value: `${maxDrawdown.toFixed(2)}%`,
      description: "Largest peak-to-trough decline",
      type: "negative",
      icon: <ShieldAlert size={18} />,
    },
    {
      title: "Correlation",
      value: correlation.toFixed(2),
      description: "Correlation with S&P 500",
      type: "neutral",
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <section className="quantitative-metrics">
      <div className="quantitative-metrics-header">
        <div>
          <span className="asset-breadcrumb">QUANTITATIVE ANALYSIS</span>
          <h2>Risk & Performance Metrics</h2>
          <p>
            Quantitative measurements for <strong>{asset.name}</strong> across the selected analysis period.
          </p>
        </div>

        <div className="metrics-period">
          <span>Analysis Period</span>
          <strong>
            {startDate} → {endDate}
          </strong>
          {isLive && (
            <span style={{ fontSize: "11px", color: "#16b981", marginLeft: "8px" }}>● Live API</span>
          )}
        </div>
      </div>

      <div className="quantitative-metrics-grid" style={{ opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
        {metricCards.map((metric) => (
          <div key={metric.title} className={`quantitative-metric-card ${metric.type}`}>
            <div className="quantitative-metric-top">
              <div className="quantitative-metric-icon">{metric.icon}</div>
              <span>{metric.title}</span>
            </div>
            <strong className="quantitative-metric-value">{metric.value}</strong>
            <span className="quantitative-metric-description">{metric.description}</span>
          </div>
        ))}
      </div>

      <div className="quantitative-engine-status">
        <div className="metric-legend-item">
          <span className="metric-legend-dot green" />
          <span>Positive / favorable</span>
        </div>
        <span className="metric-legend-separator">•</span>

        <div className="metric-legend-item">
          <span className="metric-legend-dot amber" />
          <span>Risk / variability</span>
        </div>
        <span className="metric-legend-separator">•</span>

        <div className="metric-legend-item">
          <span className="metric-legend-dot red" />
          <span>Negative / downside</span>
        </div>
        <span className="metric-legend-separator">•</span>

        <div className="metric-legend-item">
          <span className="metric-legend-dot blue" />
          <span>Neutral / relationship</span>
        </div>
        <span className="metric-legend-separator">•</span>

        <span className="engine-source">
          {isLive ? "FastAPI Risk Service (Live)" : "QuantExa Quantitative Engine"}
        </span>
      </div>
    </section>
  );
}
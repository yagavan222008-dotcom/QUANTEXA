"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Minus,
  TrendingUp,
} from "lucide-react";

import { Asset } from "@/types/market";
import { getBenchmarkData } from "@/lib/mockAnalysis";

type BenchmarkComparisonProps = {
  asset: Asset;
  startDate: string;
  endDate: string;
};

function createPath(
  values: number[],
  minValue = -40,
  maxValue = 40
) {
  const width = 900;
  const height = 300;

  if (values.length === 0) {
    return "";
  }

  return values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : (index / (values.length - 1)) *
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

export default function BenchmarkComparison({
  asset,
  startDate,
  endDate,
}: BenchmarkComparisonProps) {
  /*
   * Benchmark data now comes from the same central
   * QuantExa analysis engine used by the other sections.
   */
  const data = getBenchmarkData(
    asset,
    startDate,
    endDate
  );

  const assetValues = data.map(
    (point) => point.asset
  );

  const benchmarkValues = data.map(
    (point) => point.benchmark
  );

  const assetReturn =
    assetValues[assetValues.length - 1] ?? 0;

  const benchmarkReturn =
    benchmarkValues[
      benchmarkValues.length - 1
    ] ?? 0;

  const relativePerformance =
    assetReturn - benchmarkReturn;

  const assetPath = createPath(
    assetValues
  );

  const benchmarkPath = createPath(
    benchmarkValues
  );

  const isOutperforming =
    relativePerformance > 0;

  const isUnderperforming =
    relativePerformance < 0;

  return (
    <section className="benchmark-comparison">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="benchmark-header">

        <div>

          <span className="asset-breadcrumb">
            BENCHMARK ANALYSIS
          </span>

          <h2>
            Asset vs S&amp;P 500
          </h2>

          <p>
            Relative performance of{" "}
            <strong>
              {asset.name}
            </strong>{" "}
            against the S&amp;P 500 benchmark.
          </p>

        </div>

        <div className="benchmark-period">

          <span>
            ANALYSIS PERIOD
          </span>

          <strong>
            {startDate} → {endDate}
          </strong>

        </div>

      </div>

      {/* =================================================
          PERFORMANCE SUMMARY
      ================================================= */}

      <div className="benchmark-summary">

        {/* Asset */}

        <div className="benchmark-stat asset-stat">

          <div className="benchmark-stat-top">

            <div className="benchmark-stat-icon">
              <TrendingUp size={18} />
            </div>

            <span>
              {asset.symbol}
            </span>

          </div>

          <strong>
            {assetReturn >= 0 ? "+" : ""}
            {assetReturn.toFixed(2)}%
          </strong>

          <small>
            Selected asset return
          </small>

        </div>

        {/* Benchmark */}

        <div className="benchmark-stat">

          <div className="benchmark-stat-top">

            <div className="benchmark-stat-icon benchmark">
              <BarChart3 size={18} />
            </div>

            <span>
              S&amp;P 500
            </span>

          </div>

          <strong>
            {benchmarkReturn >= 0 ? "+" : ""}
            {benchmarkReturn.toFixed(2)}%
          </strong>

          <small>
            Benchmark return
          </small>

        </div>

        {/* Relative Performance */}

        <div
          className={`benchmark-stat ${
            isOutperforming
              ? "outperforming"
              : isUnderperforming
                ? "underperforming"
                : "neutral"
          }`}
        >

          <div className="benchmark-stat-top">

            <div className="benchmark-stat-icon">

              {isOutperforming ? (
                <ArrowUpRight size={18} />
              ) : isUnderperforming ? (
                <ArrowDownRight size={18} />
              ) : (
                <Minus size={18} />
              )}

            </div>

            <span>
              Relative Performance
            </span>

          </div>

          <strong>
            {relativePerformance >= 0
              ? "+"
              : ""}
            {relativePerformance.toFixed(2)}%
          </strong>

          <small>
            {isOutperforming
              ? "Above benchmark"
              : isUnderperforming
                ? "Below benchmark"
                : "In line with benchmark"}
          </small>

        </div>

      </div>

      {/* =================================================
          CHART
      ================================================= */}

      <div className="benchmark-chart-wrapper">

        <div className="benchmark-chart-y-axis">

          <span>
            +40%
          </span>

          <span>
            +20%
          </span>

          <span>
            0%
          </span>

          <span>
            -20%
          </span>

        </div>

        <div className="benchmark-chart-area">

          <div className="benchmark-grid">
            <span />
            <span />
            <span />
            <span />
          </div>

          <svg
            className="benchmark-svg"
            viewBox="0 0 900 300"
            preserveAspectRatio="none"
          >

            {/* S&P 500 */}

            <path
              d={benchmarkPath}
              fill="none"
              stroke="#9db4d2"
              strokeWidth="2"
              strokeDasharray="7 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Selected Asset */}

            <path
              d={assetPath}
              fill="none"
              stroke={
                asset.changePercent >= 0
                  ? "#2878ff"
                  : "#e64f64"
              }
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>

        </div>

      </div>

      {/* =================================================
          LABELS
      ================================================= */}

      <div className="benchmark-chart-labels">

        {data.map((point, index) => (
          <span
            key={`${point.label}-${index}`}
          >
            {point.label}
          </span>
        ))}

      </div>

      {/* =================================================
          LEGEND
      ================================================= */}

      <div className="benchmark-legend">

        <span>

          <i className="benchmark-dot asset" />

          {asset.symbol}

        </span>

        <span>

          <i className="benchmark-dot benchmark" />

          S&amp;P 500

        </span>

      </div>

      {/* =================================================
          QUANTITATIVE COMPARISON
      ================================================= */}

      <div className="benchmark-details">

        <div>

          <span>
            Asset Return
          </span>

          <strong
            className={
              assetReturn >= 0
                ? "benchmark-positive"
                : "benchmark-negative"
            }
          >
            {assetReturn >= 0 ? "+" : ""}
            {assetReturn.toFixed(2)}%
          </strong>

        </div>

        <div>

          <span>
            Benchmark Return
          </span>

          <strong>
            {benchmarkReturn >= 0
              ? "+"
              : ""}
            {benchmarkReturn.toFixed(2)}%
          </strong>

        </div>

        <div>

          <span>
            Relative Return
          </span>

          <strong
            className={
              relativePerformance >= 0
                ? "benchmark-positive"
                : "benchmark-negative"
            }
          >
            {relativePerformance >= 0
              ? "+"
              : ""}
            {relativePerformance.toFixed(2)}%
          </strong>

        </div>

        <div>

          <span>
            Benchmark
          </span>

          <strong>
            S&amp;P 500
          </strong>

        </div>

      </div>

      {/* =================================================
          ENGINE STATUS
      ================================================= */}

      <div className="benchmark-engine-status">

        <span className="benchmark-status-dot" />

        <span>
          QuantExa Benchmark Engine
        </span>

        <span className="benchmark-separator">
          •
        </span>

        <span>
          Relative performance calculated for
          selected period
        </span>

      </div>

    </section>
  );
}
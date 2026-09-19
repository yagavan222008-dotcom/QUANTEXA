"use client";

import { useMemo } from "react";

import { Asset } from "@/types/market";
import { useCurrency } from "@/components/CurrencyProvider";
import { getPerformanceData } from "@/lib/mockAnalysis";

type AssetPerformanceChartProps = {
  asset: Asset;
  startDate: string;
  endDate: string;
};

function createPath(
  data: { label: string; value: number }[]
) {
  const width = 900;
  const height = 320;

  const minValue = -40;
  const maxValue = 40;

  return data
    .map((point, index) => {
      const x =
        data.length === 1
          ? width / 2
          : (index / (data.length - 1)) * width;

      const y =
        height -
        ((point.value - minValue) /
          (maxValue - minValue)) *
          height;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getLatestPerformance(
  data: { label: string; value: number }[]
) {
  return data[data.length - 1]?.value ?? 0;
}

export default function AssetPerformanceChart({
  asset,
  startDate,
  endDate,
}: AssetPerformanceChartProps) {
  const { formatAmount } = useCurrency();

  /*
   * Central QuantExa mock analysis engine.
   *
   * The chart now responds to:
   * 1. Selected asset
   * 2. Selected analysis period
   */
  const data = useMemo(() => {
    return getPerformanceData(
      asset,
      startDate,
      endDate
    );
  }, [asset, startDate, endDate]);

  const path = useMemo(() => {
    return createPath(data);
  }, [data]);

  const periodReturn =
    getLatestPerformance(data);

  const isPositive =
    periodReturn >= 0;

  const strokeColor = isPositive
    ? "#2878ff"
    : "#e64f64";

  return (
    <section className="asset-performance-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="asset-performance-header">

        <div>

          <span className="asset-breadcrumb">
            HISTORICAL PERFORMANCE
          </span>

          <h2>
            {asset.name} Performance
          </h2>

          <p>
            Price performance over the selected
            analysis period.
          </p>

        </div>

        <div className="asset-performance-current">

          <span>
            Current Price
          </span>

          <strong>
            {asset.category === "index"
              ? asset.price.toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )
              : formatAmount(
                  asset.price,
                  2,
                  asset.currency
                )}
          </strong>

          <small
            className={
              asset.changePercent >= 0
                ? "asset-positive"
                : "asset-negative"
            }
          >
            {asset.changePercent >= 0
              ? "+"
              : ""}
            {asset.changePercent.toFixed(2)}%
          </small>

        </div>

      </div>

      {/* =================================================
          ANALYSIS PERIOD
      ================================================= */}

      <div className="analysis-period-display">

        <span>
          Analysis period
        </span>

        <strong>
          {startDate} → {endDate}
        </strong>

      </div>

      {/* =================================================
          CHART
      ================================================= */}

      <div className="asset-analysis-chart">

        <div className="asset-chart-y-axis">

          <span>+40%</span>

          <span>+20%</span>

          <span>0%</span>

          <span>-20%</span>

        </div>

        <div className="asset-chart-main">

          <div className="asset-chart-grid">

            <span />
            <span />
            <span />
            <span />

          </div>

          <svg
            className="asset-performance-svg"
            viewBox="0 0 900 320"
            preserveAspectRatio="none"
          >

            <path
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              vectorEffect="non-scaling-stroke"
            />

          </svg>

          {/* ZERO LINE */}

          <div className="asset-zero-line" />

        </div>

      </div>

      {/* =================================================
          X AXIS
      ================================================= */}

      <div className="asset-chart-labels">

        {data.map((point, index) => (
          <span key={`${point.label}-${index}`}>
            {point.label}
          </span>
        ))}

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="asset-performance-summary">

        <div>

          <span>
            Period Return
          </span>

          <strong
            className={
              isPositive
                ? "positive-number"
                : "negative-number"
            }
          >
            {isPositive ? "+" : ""}
            {periodReturn.toFixed(2)}%
          </strong>

        </div>

        <div>

          <span>
            Asset
          </span>

          <strong>
            {asset.symbol}
          </strong>

        </div>

        <div>

          <span>
            Data Source
          </span>

          <strong>
            QuantExa Market Engine
          </strong>

        </div>

      </div>

    </section>
  );
}
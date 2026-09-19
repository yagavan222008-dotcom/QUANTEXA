"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import { Asset } from "@/types/market";
import { getTechnicalIndicators } from "@/lib/api";

import {
  getPerformanceData,
  getTechnicalAnalysis,
} from "@/lib/mockAnalysis";

type TechnicalIndicatorsProps = {
  asset: Asset;
  startDate: string;
  endDate: string;
};

type IndicatorPoint = {
  label: string;
  price: number;
  sma20: number;
  sma50: number;
  ema20: number;
  ema50: number;
  rsi: number;
};

/* =========================================================
   TECHNICAL SERIES BUILDER

   The central mock analysis engine provides the current
   technical values. Performance data provides the shape
   of the selected analysis period.

   Later this entire layer can be replaced by the FastAPI
   technical-analysis engine.
========================================================= */

function buildIndicatorSeries(
  asset: Asset,
  startDate: string,
  endDate: string
): IndicatorPoint[] {
  const performance = getPerformanceData(
    asset,
    startDate,
    endDate
  );

  const technical = getTechnicalAnalysis(
    asset,
    startDate,
    endDate
  );

  const latestPerformance =
    performance[performance.length - 1]?.value ?? 0;

  const latestRsi = technical.rsi;

  return performance.map((point, index) => {
    /*
     * Normalize the performance curve around a
     * technical-analysis range so that the chart
     * remains visually consistent across assets.
     */
    const normalizedPrice =
      50 +
      (point.value - latestPerformance) * 0.65;

    const progress =
      performance.length <= 1
        ? 1
        : index / (performance.length - 1);

    /*
     * Moving-average relationships are derived from
     * the current central-engine values and gradually
     * converge toward the latest values.
     */
    const sma20Offset =
    ((technical.sma20 - asset.price) /
        Math.max(asset.price, 1)) *
    100;

    const sma50Offset =
    ((technical.sma50 - asset.price) /
        Math.max(asset.price, 1)) *
    100;

    const ema20Offset =
    ((technical.ema20 - asset.price) /
        Math.max(asset.price, 1)) *
    100;

    const ema50Offset =
    ((technical.ema50 - asset.price) /
        Math.max(asset.price, 1)) *
    100;

    const sma20 =
    normalizedPrice +
    sma20Offset *
        (0.45 + progress * 0.55);

    const sma50 =
    normalizedPrice +
    sma50Offset *
        (0.3 + progress * 0.7);

    const ema20 =
    normalizedPrice +
    ema20Offset *
        (0.45 + progress * 0.55);

    const ema50 =
    normalizedPrice +
    ema50Offset *
        (0.3 + progress * 0.7);

    /*
     * RSI follows the same period shape while remaining
     * within the standard 20–80 technical display range.
     */
    const rsiWave =
      (point.value - latestPerformance) * 0.22;

    const rsi =
      Math.min(
        80,
        Math.max(
          20,
          latestRsi + rsiWave
        )
      );

    return {
      label: point.label,
      price: normalizedPrice,
      sma20,
      sma50,
      ema20,
      ema50,
      rsi,
    };
  });
}

/* =========================================================
   SVG PATH HELPER
========================================================= */

function createPath(
  values: number[],
  width = 760,
  height = 230
) {
  if (values.length === 0) {
    return "";
  }

  const minValue =
    Math.min(...values) - 4;

  const maxValue =
    Math.max(...values) + 4;

  const range =
    maxValue - minValue || 1;

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
          range) *
          height;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

/* =========================================================
   RSI PATH
========================================================= */

function createRsiPath(
  values: number[],
  width = 760,
  height = 180
) {
  const minValue = 20;
  const maxValue = 80;

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

/* =========================================================
   COMPONENT
========================================================= */

export default function TechnicalIndicators({
  asset,
  startDate,
  endDate,
}: TechnicalIndicatorsProps) {
  const [apiIndicator, setApiIndicator] = useState<{
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
    rsi: number;
    smaSignal: string;
    emaSignal: string;
    rsiSignal: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    getTechnicalIndicators(asset.symbol)
      .then((res) => {
        if (isMounted && res && res.latest) {
          const latest = res.latest;
          const price = latest.price || asset.price || 1;
          const sma20 = latest.sma_fast ?? price;
          const sma50 = latest.sma_slow ?? price;
          const ema20 = latest.ema_fast ?? price;
          const ema50 = latest.ema_slow ?? price;
          const rsi = 50; // default signal

          const smaSignal = price > sma20 && sma20 > sma50 ? "Bullish" : price < sma20 && sma20 < sma50 ? "Bearish" : "Neutral";
          const emaSignal = price > ema20 && ema20 > ema50 ? "Bullish" : price < ema20 && ema20 < ema50 ? "Bearish" : "Neutral";
          const rsiSignal = rsi >= 70 ? "Overbought" : rsi <= 30 ? "Oversold" : "Neutral";

          setApiIndicator({
            sma20,
            sma50,
            ema20,
            ema50,
            rsi,
            smaSignal,
            emaSignal,
            rsiSignal,
          });
        }
      })
      .catch(() => {
        // Fallback to local calculation
      });

    return () => {
      isMounted = false;
    };
  }, [asset.symbol, startDate, endDate]);

  const data = useMemo(() => {
    return buildIndicatorSeries(
      asset,
      startDate,
      endDate
    );
  }, [asset, startDate, endDate]);

  const fallbackTechnical = useMemo(() => {
    return getTechnicalAnalysis(
      asset,
      startDate,
      endDate
    );
  }, [asset, startDate, endDate]);

  const technical = apiIndicator || fallbackTechnical;

  const pricePath = useMemo(
    () =>
      createPath(
        data.map(
          (point) => point.price
        )
      ),
    [data]
  );

  const sma20Path = useMemo(
    () =>
      createPath(
        data.map(
          (point) => point.sma20
        )
      ),
    [data]
  );

  const sma50Path = useMemo(
    () =>
      createPath(
        data.map(
          (point) => point.sma50
        )
      ),
    [data]
  );

  const ema20Path = useMemo(
    () =>
      createPath(
        data.map(
          (point) => point.ema20
        )
      ),
    [data]
  );

  const ema50Path = useMemo(
    () =>
      createPath(
        data.map(
          (point) => point.ema50
        )
      ),
    [data]
  );

  const rsiPath = useMemo(
    () =>
      createRsiPath(
        data.map(
          (point) => point.rsi
        )
      ),
    [data]
  );

  const latest = data[data.length - 1];

  const rsiState =
    technical.rsiSignal;

  return (
    <section className="technical-indicators">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="technical-indicators-header">

        <div>

          <span className="asset-breadcrumb">
            TECHNICAL ANALYSIS
          </span>

          <h2>
            Technical Indicators
          </h2>

          <p>
            Trend and momentum indicators for{" "}
            <strong>
              {asset.name}
            </strong>{" "}
            across the selected analysis period.
          </p>

        </div>

        <div className="technical-period">

          <CalendarDays size={16} />

          <div>

            <span>
              Analysis Period
            </span>

            <strong>
              {startDate} → {endDate}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          INDICATOR GRID
      ================================================= */}

      <div className="technical-indicator-grid">

        {/* =================================================
            SMA
        ================================================= */}

        <article className="technical-indicator-card">

          <div className="technical-card-header">

            <div className="technical-card-title">

              <div className="technical-card-icon blue">
                <TrendingUp size={18} />
              </div>

              <div>

                <h3>
                  SMA
                </h3>

                <span>
                  Simple Moving Average
                </span>

              </div>

            </div>

            <span className="technical-badge">
              {technical.smaSignal}
            </span>

          </div>

          <div className="technical-chart">

            <div className="technical-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg
              viewBox="0 0 760 230"
              preserveAspectRatio="none"
            >

              <path
                d={pricePath}
                fill="none"
                stroke="#9db7d8"
                strokeWidth="2"
                strokeDasharray="5 5"
                strokeLinecap="round"
              />

              <path
                d={sma20Path}
                fill="none"
                stroke="#2878ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={sma50Path}
                fill="none"
                stroke="#7567e8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </div>

          <div className="technical-legend">

            <span>
              <i className="legend-price" />
              Price
            </span>

            <span>
              <i className="legend-sma20" />
              SMA 20
            </span>

            <span>
              <i className="legend-sma50" />
              SMA 50
            </span>

          </div>

          <div className="technical-values">

            <div>

              <span>
                SMA 20
              </span>

              <strong>
                {technical.sma20.toFixed(2)}
              </strong>

            </div>

            <div>

              <span>
                SMA 50
              </span>

              <strong>
                {technical.sma50.toFixed(2)}
              </strong>

            </div>

          </div>

        </article>

        {/* =================================================
            EMA
        ================================================= */}

        <article className="technical-indicator-card">

          <div className="technical-card-header">

            <div className="technical-card-title">

              <div className="technical-card-icon purple">
                <Activity size={18} />
              </div>

              <div>

                <h3>
                  EMA
                </h3>

                <span>
                  Exponential Moving Average
                </span>

              </div>

            </div>

            <span className="technical-badge">
              {technical.emaSignal}
            </span>

          </div>

          <div className="technical-chart">

            <div className="technical-chart-grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg
              viewBox="0 0 760 230"
              preserveAspectRatio="none"
            >

              <path
                d={pricePath}
                fill="none"
                stroke="#9db7d8"
                strokeWidth="2"
                strokeDasharray="5 5"
                strokeLinecap="round"
              />

              <path
                d={ema20Path}
                fill="none"
                stroke="#2878ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={ema50Path}
                fill="none"
                stroke="#b06cff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </div>

          <div className="technical-legend">

            <span>
              <i className="legend-price" />
              Price
            </span>

            <span>
              <i className="legend-ema20" />
              EMA 20
            </span>

            <span>
              <i className="legend-ema50" />
              EMA 50
            </span>

          </div>

          <div className="technical-values">

            <div>

              <span>
                EMA 20
              </span>

              <strong>
                {technical.ema20.toFixed(2)}
              </strong>

            </div>

            <div>

              <span>
                EMA 50
              </span>

              <strong>
                {technical.ema50.toFixed(2)}
              </strong>
            </div>

          </div>

        </article>

        {/* =================================================
            RSI
        ================================================= */}

        <article className="technical-indicator-card">

          <div className="technical-card-header">

            <div className="technical-card-title">

              <div className="technical-card-icon green">
                <BarChart3 size={18} />
              </div>

              <div>

                <h3>
                  RSI
                </h3>

                <span>
                  Relative Strength Index
                </span>

              </div>

            </div>

            <span
              className={`technical-rsi-state ${
                rsiState
                  .toLowerCase()
                  .replace(" ", "-")
              }`}
            >
              {rsiState}
            </span>

          </div>

          <div className="technical-chart rsi-chart">

            <div className="rsi-zone overbought">
              <span>70</span>
            </div>

            <div className="rsi-zone neutral">
              <span>50</span>
            </div>

            <div className="rsi-zone oversold">
              <span>30</span>
            </div>

            <svg
              viewBox="0 0 760 180"
              preserveAspectRatio="none"
            >

              <path
                d={rsiPath}
                fill="none"
                stroke="#16a36f"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </div>

          <div className="rsi-scale">

            {data.map((point, index) => (
              <span
                key={`${point.label}-${index}`}
              >
                {point.label}
              </span>
            ))}

          </div>

          <div className="technical-values">

            <div>

              <span>
                Current RSI
              </span>

              <strong
                className={
                  technical.rsi >= 70
                    ? "rsi-overbought"
                    : technical.rsi <= 30
                      ? "rsi-oversold"
                      : "rsi-neutral"
                }
              >
                {technical.rsi.toFixed(1)}
              </strong>

            </div>

            <div>

              <span>
                Signal
              </span>

              <strong>
                {rsiState}
              </strong>

            </div>

          </div>

        </article>

      </div>

      {/* =================================================
          ENGINE STATUS
      ================================================= */}

      <div className="technical-engine-status">

        <span className="technical-status-dot" />

        <span>
          QuantExa Technical Analysis Engine
        </span>

        <span className="technical-status-separator">
          •
        </span>

        <span>
          SMA 20 / 50
        </span>

        <span className="technical-status-separator">
          •
        </span>

        <span>
          EMA 20 / 50
        </span>

        <span className="technical-status-separator">
          •
        </span>

        <span>
          RSI 14
        </span>

      </div>

    </section>
  );
}
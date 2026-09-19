"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { ChevronDown } from "lucide-react";

type Period = "1M" | "3M" | "6M" | "1Y" | "ALL";

type DataPoint = {
  label: string;
  bitcoin: number;
  gold: number;
  nvidia: number;
  sp500: number;
};

type Series = {
  name: string;
  color: string;
  key: keyof Omit<DataPoint, "label">;
};

const series: Series[] = [
  {
    name: "Bitcoin",
    color: "#2878FF",
    key: "bitcoin",
  },
  {
    name: "Gold",
    color: "#F5B82E",
    key: "gold",
  },
  {
    name: "NVIDIA",
    color: "#16B981",
    key: "nvidia",
  },
  {
    name: "S&P 500",
    color: "#7567E8",
    key: "sp500",
  },
];

const marketData: DataPoint[] = [
  {
    label: "Jan",
    bitcoin: -11.2,
    gold: -20.4,
    nvidia: -28.5,
    sp500: -31.2,
  },
  {
    label: "Feb",
    bitcoin: -7.8,
    gold: -18.2,
    nvidia: -25.7,
    sp500: -28.4,
  },
  {
    label: "Mar",
    bitcoin: -2.4,
    gold: -16.8,
    nvidia: -20.3,
    sp500: -27.2,
  },
  {
    label: "Apr",
    bitcoin: 8.6,
    gold: -11.7,
    nvidia: -17.8,
    sp500: -24.1,
  },
  {
    label: "May",
    bitcoin: 6.9,
    gold: -12.8,
    nvidia: -15.9,
    sp500: -24.8,
  },
  {
    label: "Jun",
    bitcoin: 18.7,
    gold: -8.9,
    nvidia: -10.7,
    sp500: -21.4,
  },
  {
    label: "Jul",
    bitcoin: 14.9,
    gold: -3.2,
    nvidia: -8.4,
    sp500: -22.1,
  },
  {
    label: "Aug",
    bitcoin: 24.8,
    gold: 2.1,
    nvidia: -1.8,
    sp500: -17.6,
  },
  {
    label: "Sep",
    bitcoin: 21.6,
    gold: 5.7,
    nvidia: 1.2,
    sp500: -15.8,
  },
  {
    label: "Oct",
    bitcoin: 31.4,
    gold: 8.8,
    nvidia: 5.7,
    sp500: -11.9,
  },
  {
    label: "Nov",
    bitcoin: 27.9,
    gold: 10.4,
    nvidia: 8.3,
    sp500: -8.6,
  },
  {
    label: "Dec",
    bitcoin: 35.2,
    gold: 13.7,
    nvidia: 12.8,
    sp500: -4.8,
  },
];

const periodRanges: Record<Period, number> = {
  "1M": 2,
  "3M": 4,
  "6M": 7,
  "1Y": 12,
  ALL: 12,
};

function createPath(
  data: DataPoint[],
  key: keyof Omit<DataPoint, "label">
) {
  const width = 860;
  const height = 270;
  const minValue = -40;
  const maxValue = 40;

  if (data.length === 0) {
    return "";
  }

  if (data.length === 1) {
    const value = data[0][key] as number;

    const x = width / 2;

    const y =
      height -
      ((value - minValue) /
        (maxValue - minValue)) *
        height;

    return `M ${x} ${y}`;
  }

  return data
    .map((point, index) => {
      const value = point[key] as number;

      const x =
        (index / (data.length - 1)) *
        width;

      const y =
        height -
        ((value - minValue) /
          (maxValue - minValue)) *
          height;

      if (index === 0) {
        return `M ${x} ${y}`;
      }

      const previousPoint = data[index - 1];

      const previousValue =
        previousPoint[key] as number;

      const previousX =
        ((index - 1) /
          (data.length - 1)) *
        width;

      const previousY =
        height -
        ((previousValue - minValue) /
          (maxValue - minValue)) *
          height;

      const controlPointOffset =
        (x - previousX) * 0.45;

      const control1X =
        previousX + controlPointOffset;

      const control2X =
        x - controlPointOffset;

      return `
        C
        ${control1X} ${previousY},
        ${control2X} ${y},
        ${x} ${y}
      `;
    })
    .join(" ");
}

export default function PerformanceChart() {
  const [period, setPeriod] =
    useState<Period>("6M");

  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  const [mouseX, setMouseX] =
    useState<number>(0);

  /*
   * Controls whether the tooltip,
   * vertical line and data points
   * are currently visible.
   */
  const [isHovering, setIsHovering] =
    useState(false);

  /*
   * Stores the delay timer.
   *
   * The tooltip will only appear after
   * the cursor stops moving for 180ms.
   */
  const hoverTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /*
   * Clean up the timer when the component
   * is removed from the page.
   */
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const visibleData = useMemo(() => {
    const count = periodRanges[period];

    return marketData.slice(
      Math.max(
        0,
        marketData.length - count
      )
    );
  }, [period]);

  const paths = useMemo(() => {
    return series.map((item) => ({
      ...item,
      path: createPath(
        visibleData,
        item.key
      ),
    }));
  }, [visibleData]);

  const activePoint =
    hoveredIndex !== null
      ? visibleData[hoveredIndex]
      : null;

  /*
   * Position of the selected data point.
   */
  const hoverPosition =
    visibleData.length > 1 &&
    hoveredIndex !== null
      ? (hoveredIndex /
          (visibleData.length - 1)) *
        100
      : mouseX;

  /*
   * Keep the tooltip inside the chart
   * near the left and right edges.
   */

  function formatPercent(value: number) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(
      1
    )}%`;
  }

  function handleMouseMove(
    event: MouseEvent<HTMLDivElement>
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const percentage =
      Math.max(
        0,
        Math.min(
          100,
          (x / rect.width) * 100
        )
      );

    /*
     * The cursor is moving.
     *
     * Immediately hide the tooltip and
     * vertical indicator.
     */
    setIsHovering(false);

    /*
     * Cancel the previous timer.
     */
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    /*
     * Start a new timer.
     *
     * If the cursor moves again before
     * 180ms, this timer is cancelled.
     *
     * Therefore the tooltip only appears
     * when the cursor actually stops.
     */
    hoverTimerRef.current = setTimeout(() => {
      const nearestIndex =
        Math.round(
          (percentage / 100) *
            (visibleData.length - 1)
        );

      setMouseX(percentage);
      setHoveredIndex(nearestIndex);
      setIsHovering(true);
    }, 180);
  }

  function handleMouseLeave() {
    /*
     * Cancel any pending tooltip timer.
     */
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    /*
     * Remove tooltip and selected point.
     */
    setIsHovering(false);
    setHoveredIndex(null);
  }

  function handlePeriodChange(
    nextPeriod: Period
  ) {
    /*
     * Cancel any pending tooltip.
     */
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    setPeriod(nextPeriod);
    setHoveredIndex(null);
    setIsHovering(false);
  }

  return (
    <section className="performance-card">
      <div className="section-header">
        <div>
          <h2>Market Performance</h2>

          <p>
            Comparative performance over time
          </p>
        </div>

        <div className="chart-controls">
          <button
            type="button"
            className="chart-select"
          >
            Compare Assets

            <ChevronDown size={14} />
          </button>

          <div className="period-selector">
            {(
              [
                "1M",
                "3M",
                "6M",
                "1Y",
                "ALL",
              ] as Period[]
            ).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() =>
                  handlePeriodChange(item)
                }
                className={
                  period === item
                    ? "period-active"
                    : ""
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          <span>+40%</span>
          <span>+20%</span>
          <span>0%</span>
          <span>-20%</span>
          <span>-40%</span>
        </div>

        <div
          className="chart-area"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="chart-grid">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <svg
            viewBox="0 0 860 270"
            preserveAspectRatio="none"
            className="performance-svg"
          >
            {paths.map((item) => (
              <path
                key={item.name}
                d={item.path}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="performance-line"
              />
            ))}

            {isHovering &&
              activePoint &&
              series.map((item) => {
                const value =
                  activePoint[
                    item.key
                  ] as number;

                const x =
                  hoveredIndex !== null
                    ? (hoveredIndex /
                        Math.max(
                          visibleData.length -
                            1,
                          1
                        )) *
                      860
                    : 0;

                const y =
                  270 -
                  ((value + 40) /
                    80) *
                    270;

                return (
                  <circle
                    key={`hover-${item.name}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#ffffff"
                    stroke={item.color}
                    strokeWidth="3"
                    className="chart-data-point"
                  />
                );
              })}
          </svg>

          {isHovering && (
            <div
              className="chart-hover-line"
              style={{
                left: `${hoverPosition}%`,
              }}
            >
              <span />
            </div>
          )}

          {isHovering && activePoint && (
            <div className="chart-tooltip chart-tooltip-visible">
              <strong>
                {activePoint.label}
              </strong>

              {series.map((item) => {
                const value =
                  activePoint[
                    item.key
                  ] as number;

                return (
                  <div key={item.name}>
                    <span>
                      <i
                        style={{
                          background:
                            item.color,
                        }}
                      />

                      {item.name}
                    </span>

                    <b
                      className={
                        value >= 0
                          ? "positive-text"
                          : "negative-text"
                      }
                    >
                      {formatPercent(value)}
                    </b>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="chart-months">
        {visibleData.map((point) => (
          <span key={point.label}>
            {point.label}
          </span>
        ))}
      </div>

      <div className="chart-legend">
        {series.map((item) => (
          <span key={item.name}>
            <i
              style={{
                background: item.color,
              }}
            />

            {item.name}
          </span>
        ))}
      </div>
    </section>
  );
}
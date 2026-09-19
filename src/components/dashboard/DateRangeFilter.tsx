"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

type DateRangeFilterProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
};

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  const [activeRange, setActiveRange] = useState("1Y");

  const ranges = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "MAX"];

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  function applyRange(range: string) {
    const today = new Date();

    let start = new Date(today);

    switch (range) {
      case "1M":
        start.setMonth(today.getMonth() - 1);
        break;

      case "3M":
        start.setMonth(today.getMonth() - 3);
        break;

      case "6M":
        start.setMonth(today.getMonth() - 6);
        break;

      case "1Y":
        start.setFullYear(today.getFullYear() - 1);
        break;

      case "3Y":
        start.setFullYear(today.getFullYear() - 3);
        break;

      case "5Y":
        start.setFullYear(today.getFullYear() - 5);
        break;

      case "MAX":
        start = new Date("2000-01-01");
        break;

      default:
        return;
    }

    onStartDateChange(formatDate(start));
    onEndDateChange(formatDate(today));

    setActiveRange(range);
  }

  return (
    <section className="date-range-filter">
      <div className="date-range-title">
        <CalendarDays size={18} />
        <span>Analysis Period</span>
      </div>

      <div className="date-inputs">
        <label>
          <span>From</span>

          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => {
              onStartDateChange(event.target.value);
              setActiveRange("");
            }}
          />
        </label>

        <span className="date-separator">→</span>

        <label>
          <span>To</span>

          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => {
              onEndDateChange(event.target.value);
              setActiveRange("");
            }}
          />
        </label>
      </div>

      <div className="quick-ranges">
        {ranges.map((range) => (
          <button
            key={range}
            type="button"
            className={activeRange === range ? "active" : ""}
            onClick={() => applyRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <button
        className="range-dropdown"
        type="button"
        onClick={() => setActiveRange("")}
      >
        Custom
        <ChevronDown size={16} />
      </button>
    </section>
  );
}
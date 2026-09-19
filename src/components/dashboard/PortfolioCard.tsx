"use client";

import {
  ArrowUpRight,
  Eye,
} from "lucide-react";

import { Portfolio } from "@/types/market";

import { useCurrency } from "@/components/CurrencyProvider";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export default function PortfolioCard({
  portfolio,
}: PortfolioCardProps) {

  const {
    formatAmount,
    currency,
    } = useCurrency();

  return (
    <section className="portfolio-card dashboard-card">

      {/* =====================================================
          PORTFOLIO HEADER
      ===================================================== */}

      <div className="portfolio-header">

        <span>
          Total Portfolio Value
        </span>

        <div className="portfolio-actions">

          <Eye size={18} />

          <span className="portfolio-currency-label">
            {currency.code} {currency.symbol}
          </span>

        </div>

      </div>

      {/* =====================================================
          PORTFOLIO VALUE
      ===================================================== */}

      <div className="portfolio-value">

        {formatAmount(
          portfolio.totalValue,
          2,
          portfolio.currency
        )}

      </div>

      {/* =====================================================
          MONTHLY GROWTH
      ===================================================== */}

      <div className="portfolio-growth">

        <ArrowUpRight size={16} />

        +{portfolio.monthlyChangePercent.toFixed(2)}%

        <span>
          than last month
        </span>

      </div>

      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div className="portfolio-buttons">

        <button className="primary-action">
          ↗ Transfer
        </button>

        <button className="secondary-action">
          ↩ Request
        </button>

      </div>

    </section>
  );
}
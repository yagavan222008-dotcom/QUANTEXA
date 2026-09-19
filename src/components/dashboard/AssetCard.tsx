"use client";

import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import { Asset } from "@/types/market";

import { useCurrency } from "@/components/CurrencyProvider";

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({
  asset,
}: AssetCardProps) {
  const { formatAmount } = useCurrency();

  const isPositive =
    asset.changePercent >= 0;

  return (
    <Link
      href={`/assets/${asset.id}`}
      className="asset-card"
    >

      {/* =====================================================
          ASSET HEADER
      ===================================================== */}

      <div className="asset-card-top">

        <div
          className="asset-icon"
          style={{
            backgroundColor: `${asset.color}18`,
            color: asset.color,
          }}
        >
          {asset.symbol === "BTCUSD"
            ? "₿"
            : asset.symbol === "XAUUSD"
              ? "Au"
              : asset.symbol === "NVDA"
                ? "N"
                : "500"}
        </div>

        <div className="asset-name">

          <strong>
            {asset.name}
          </strong>

          <span>
            {asset.symbol}
          </span>

        </div>

      </div>

      {/* =====================================================
          PRICE
      ===================================================== */}

      <div className="asset-price">
        {asset.category === "index"
            ? asset.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : formatAmount(
                asset.price,
                2,
                "USD"
            )}
      </div>

      {/* =====================================================
          DAILY CHANGE
      ===================================================== */}

      <div
        className={`asset-change ${
          isPositive
            ? "asset-change-positive"
            : "asset-change-negative"
        }`}
      >

        {isPositive ? (
          <ArrowUpRight size={14} />
        ) : (
          <ArrowDownRight size={14} />
        )}

        {isPositive ? "+" : ""}

        {asset.changePercent.toFixed(2)}%

      </div>

      {/* =====================================================
          MINI PERFORMANCE BARS
      ===================================================== */}

      <div className="asset-mini-chart">

        <span />
        <span />
        <span />
        <span />
        <span />
        <span />

      </div>

    </Link>
  );
}
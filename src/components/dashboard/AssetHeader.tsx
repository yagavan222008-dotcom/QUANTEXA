"use client";

import { useState } from "react";

import {
  ChevronDown,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useCurrency } from "@/components/CurrencyProvider";

import { assets } from "@/lib/mockMarketData";
import { Asset } from "@/types/market";


type AssetHeaderProps = {
  selectedAsset: Asset;
  onAssetChange: (asset: Asset) => void;
};


function getAssetIcon(symbol: string) {
  if (symbol === "XAUUSD") {
    return "Au";
  }

  if (symbol === "BTCUSD") {
    return "₿";
  }

  if (symbol === "NVDA") {
    return "N";
  }

  return "500";
}


export default function AssetHeader({
  selectedAsset,
  onAssetChange,
}: AssetHeaderProps) {

  const { formatAmount, currency } =
    useCurrency();

  const [isOpen, setIsOpen] =
    useState(false);


  function displayPrice(asset: Asset) {

    /*
     * S&P 500 is an index.
     *
     * Index values should not be
     * converted between currencies.
     */

    if (asset.category === "index") {
      return asset.price.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
    }

    return formatAmount(
      asset.price,
      2,
      asset.currency
    );
  }


  return (
    <section className="asset-header">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="asset-header-main">

        <div>

          <div className="asset-breadcrumb">
            QUANTITATIVE RESEARCH
          </div>


          <div className="asset-title-row">

            <h1>
              Asset Intelligence
            </h1>


            <button
              type="button"
              className="asset-selector"
              onClick={() =>
                setIsOpen(!isOpen)
              }
            >

              <span>
                {selectedAsset.name}
              </span>

              <ChevronDown size={17} />

            </button>

          </div>


          <p className="asset-description">
            Deep quantitative analysis, risk metrics
            and historical performance for individual
            assets.
          </p>

        </div>


        <button
          type="button"
          className="favorite-button"
          aria-label="Add asset to favorites"
        >
          <Star size={20} />
        </button>

      </div>


      {/* =================================================
          ASSET DROPDOWN
      ================================================= */}

      {isOpen && (

        <div className="asset-dropdown">

          {assets.map((asset) => (

            <button
              type="button"
              key={asset.id}
              className={`asset-dropdown-item ${
                selectedAsset.id === asset.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => {

                onAssetChange(asset);

                setIsOpen(false);

              }}
            >

              <div className="asset-dropdown-left">

                <div className="asset-symbol-icon">
                  {getAssetIcon(
                    asset.symbol
                  )}
                </div>


                <div>

                  <strong>
                    {asset.name}
                  </strong>

                  <span>
                    {asset.symbol}
                  </span>

                </div>

              </div>


              <div className="asset-dropdown-right">

                <strong>
                  {displayPrice(asset)}
                </strong>


                <span
                  className={
                    asset.changePercent >= 0
                      ? "asset-positive"
                      : "asset-negative"
                  }
                >

                  {asset.changePercent >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}

                  {asset.changePercent >= 0
                    ? "+"
                    : ""}

                  {asset.changePercent.toFixed(2)}%

                </span>

              </div>

            </button>

          ))}

        </div>

      )}


      {/* =================================================
          SELECTED ASSET CARD
      ================================================= */}

      <div className="selected-asset-card">

        <div className="selected-asset-info">

          <div className="selected-asset-icon">

            {getAssetIcon(
              selectedAsset.symbol
            )}

          </div>


          <div>

            <span className="selected-asset-label">
              SELECTED ASSET
            </span>


            <h2>
              {selectedAsset.name}
            </h2>


            <span className="selected-asset-symbol">
              {selectedAsset.symbol}
            </span>

          </div>

        </div>


        <div className="selected-asset-price">

          <span>
            Current Price
          </span>


          <strong>
            {displayPrice(selectedAsset)}
          </strong>


          <div
            className={
              selectedAsset.changePercent >= 0
                ? "asset-positive"
                : "asset-negative"
            }
          >

            {selectedAsset.changePercent >= 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}

            {selectedAsset.changePercent >= 0
              ? "+"
              : ""}

            {selectedAsset.changePercent.toFixed(2)}%

          </div>

        </div>

      </div>


      {/* =================================================
          CURRENCY INDICATOR
      ================================================= */}

      <div className="asset-currency-indicator">

        Displaying monetary values in{" "}

        <strong>
          {currency.code}
        </strong>{" "}

        {currency.symbol}

      </div>

    </section>
  );
}
"use client";

import { useState } from "react";

import AssetHeader from "@/components/dashboard/AssetHeader";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import AssetPerformanceChart from "@/components/dashboard/AssetPerformanceChart";
import QuantitativeMetrics from "@/components/dashboard/QuantitativeMetrics";
import TechnicalIndicators from "@/components/dashboard/TechnicalIndicators";
import QuantExaIntelligence from "@/components/dashboard/QuantExaIntelligence";
import BenchmarkComparison from "@/components/dashboard/BenchmarkComparison";

import { assets } from "@/lib/mockMarketData";
import { Asset } from "@/types/market";

export default function AssetIntelligencePage() {
  const [selectedAsset, setSelectedAsset] =
    useState<Asset>(assets[1]);

  const [startDate, setStartDate] =
    useState("2025-09-19");

  const [endDate, setEndDate] =
    useState("2026-09-19");

  return (
    <main className="asset-intelligence-page">

      <AssetHeader
        selectedAsset={selectedAsset}
        onAssetChange={setSelectedAsset}
      />

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <AssetPerformanceChart
        asset={selectedAsset}
        startDate={startDate}
        endDate={endDate}
      />

      <QuantitativeMetrics
        asset={selectedAsset}
        startDate={startDate}
        endDate={endDate}
      />

      <TechnicalIndicators
        asset={selectedAsset}
        startDate={startDate}
        endDate={endDate}
      />

      <QuantExaIntelligence
        asset={selectedAsset}
        startDate={startDate}
        endDate={endDate}
      />

      <BenchmarkComparison
        asset={selectedAsset}
        startDate={startDate}
        endDate={endDate}
      />

    </main>
  );
}
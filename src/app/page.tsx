"use client";

import { useEffect, useState } from "react";
import AssetCard from "@/components/dashboard/AssetCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import PortfolioCard from "@/components/dashboard/PortfolioCard";

import {
  allocation,
  assets as mockAssets,
  insights,
  marketRegime,
  portfolio,
  topMovers,
} from "@/lib/mockMarketData";

import { useCurrency } from "@/components/CurrencyProvider";
import { aiResearch, AIResearchResponse, getAssets } from "@/lib/api";

import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock3,
  ExternalLink,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { formatAmount } = useCurrency();
  const [displayAssets, setDisplayAssets] = useState(mockAssets);

  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResearchResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleAiSubmit(customQuery?: string) {
    const q = (customQuery !== undefined ? customQuery : aiQuery).trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const res = await aiResearch(q);
      setAiResponse(res);
    } catch (err) {
      console.error("AI research error:", err);
      setAiError("Unable to complete research query at this time. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    getAssets()
      .then((res) => {
        if (res && res.assets && res.assets.length > 0) {
          const updated = mockAssets.map((asset) => {
            const match = res.assets.find(
              (a) =>
                a.symbol.toUpperCase() === asset.symbol.toUpperCase() ||
                (asset.symbol === "BTCUSD" && a.symbol === "BTC-USD") ||
                (asset.symbol === "XAUUSD" && a.symbol === "GC=F")
            );
            if (match) {
              return {
                ...asset,
                price: match.latest_price || asset.price,
                changePercent: match.change_percent ?? asset.changePercent,
              };
            }
            return asset;
          });
          setDisplayAssets(updated);
        }
      })
      .catch(() => {});
  }, []);

  /*
   * ============================================================
   * CURRENCY FORMATTER
   * ============================================================
   *
   * All monetary values in the dashboard should pass through
   * this function.
   *
   * Source prices in our mock data are USD.
   */

  const formatUSD = (
    amount: number,
    decimals = 2
  ) => {
    return formatAmount(
      amount,
      decimals,
      "USD"
    );
  };


  return (
    <div className="dashboard-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-eyebrow">
            QUANTITATIVE RESEARCH
          </span>

          <h1>
            Market Overview
          </h1>

          <p>
            Global markets, key assets, and research insights at a glance.
          </p>

        </div>


        <div className="dashboard-header-controls">

          <button className="date-button">

            <Clock3 size={16} />

            <span>1D</span>
            <span>1W</span>
            <span>1M</span>
            <span>3M</span>
            <span>1Y</span>
            <span>ALL</span>

          </button>

        </div>

      </div>


      {/* =====================================================
          MAIN DASHBOARD GRID
      ===================================================== */}

      <div className="dashboard-grid">


        {/* ===================================================
            CENTER COLUMN
        =================================================== */}

        <div className="dashboard-main">


          {/* =================================================
              ASSET CARDS
          ================================================= */}

          <div className="asset-grid">

            {displayAssets.map((asset) => (

              <AssetCard
                key={asset.id}
                asset={asset}
              />

            ))}

          </div>


          {/* =================================================
              PERFORMANCE CHART
          ================================================= */}

          <PerformanceChart />


          {/* =================================================
              BOTTOM CARDS
          ================================================= */}

          <div className="dashboard-bottom-grid">


            {/* =================================================
                KEY INSIGHTS
            ================================================= */}

            <section className="dashboard-card insights-card">

              <div className="card-header">

                <div className="card-title">

                  <div className="card-icon blue">
                    <Lightbulb size={17} />
                  </div>

                  <h2>
                    Key Insights
                  </h2>

                </div>


                <button className="view-all-button">

                  View all

                  <ArrowUpRight size={14} />

                </button>

              </div>


              <div className="insights-list">

                {insights.map((insight) => (

                  <div
                    className="insight-row"
                    key={insight.id}
                  >

                    <div
                      className={`insight-icon ${insight.type}`}
                    >

                      <TrendingUp size={15} />

                    </div>


                    <div className="insight-content">

                      <strong>
                        {insight.title}
                      </strong>

                      <span>
                        {insight.description}
                      </span>

                    </div>


                    <time>
                      {insight.timeAgo}
                    </time>

                  </div>

                ))}

              </div>

            </section>


            {/* =================================================
                TOP MOVERS
            ================================================= */}

            <section className="dashboard-card movers-card">

              <div className="card-header">

                <div className="card-title">

                  <div className="card-icon purple">

                    <BarChart3 size={17} />

                  </div>

                  <h2>
                    Top Movers
                  </h2>

                </div>


                <button className="view-all-button">

                  View all

                  <ArrowUpRight size={14} />

                </button>

              </div>


              <div className="mover-tabs">

                <button className="mover-tab-active">
                  Gainers
                </button>

                <button>
                  Losers
                </button>

                <button>
                  Most Active
                </button>

              </div>


              <div className="movers-list">

                {topMovers.map((mover) => (

                  <div
                    className="mover-row"
                    key={mover.symbol}
                  >

                    <div className="mover-company-icon">

                      {mover.symbol.charAt(0)}

                    </div>


                    <div className="mover-name">

                      <strong>
                        {mover.name}
                      </strong>

                      <span>
                        {mover.symbol}
                      </span>

                    </div>


                    {/* =========================================
                        CURRENCY FIX
                    ========================================= */}

                    <strong className="mover-price">

                      {formatUSD(
                        mover.price,
                        2
                      )}

                    </strong>


                    <span
                      className={
                        mover.changePercent >= 0
                          ? "positive-text"
                          : "negative-text"
                      }
                    >

                      {mover.changePercent >= 0
                        ? "+"
                        : ""}

                      {mover.changePercent.toFixed(2)}%

                    </span>

                  </div>

                ))}

              </div>

            </section>

          </div>

        </div>


        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <aside className="dashboard-sidebar">


          {/* =================================================
              PORTFOLIO
          ================================================= */}

          <PortfolioCard
            portfolio={portfolio}
          />


          {/* =================================================
              ASSET ALLOCATION
          ================================================= */}

          <section className="dashboard-card allocation-card">

            <div className="card-header">

              <div className="card-title">

                <h2>
                  Asset Allocation
                </h2>

              </div>


              <button className="view-all-button">

                View all

                <ArrowUpRight size={14} />

              </button>

            </div>


            <div className="allocation-content">


              <div className="allocation-chart">

                <div className="allocation-donut">

                  <div className="allocation-center">

                    <strong
                      className={`allocation-center-value ${
                        formatUSD(portfolio.totalValue, 0).length > 14
                          ? "very-long"
                          : formatUSD(portfolio.totalValue, 0).length > 11
                          ? "long"
                          : formatUSD(portfolio.totalValue, 0).length > 8
                          ? "medium"
                          : "normal"
                      }`}
                    >
                      {formatUSD(
                        portfolio.totalValue,
                        0
                      )}
                    </strong>

                    <span>
                      Total
                    </span>

                  </div>

                </div>

              </div>


              <div className="allocation-list">

                {allocation.map((item) => (

                  <div
                    className="allocation-row"
                    key={item.name}
                  >

                    <span className="allocation-name">

                      <i
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                      {item.name}

                    </span>


                    <strong>
                      {item.percentage}%
                    </strong>

                  </div>

                ))}

              </div>

            </div>

          </section>


          {/* =================================================
              MARKET REGIME
          ================================================= */}

          <section className="dashboard-card regime-card">

            <div className="card-header">

              <div className="card-title">

                <h2>
                  Market Regime
                </h2>

              </div>


              <span className="live-status">

                <i />

                Live

              </span>

            </div>


            <div className="regime-content">

              <div className="regime-icon">

                <TrendingUp size={23} />

              </div>


              <div className="regime-info">

                <strong>
                  {marketRegime.name}
                </strong>

                <span>
                  {marketRegime.confidence}
                </span>

              </div>


              <ChevronRight size={18} />

            </div>

          </section>


          {/* =================================================
              QUANTEXA AI
          ================================================= */}

          <section className="dashboard-card ai-card">

            <div className="ai-header">

              <div className="ai-title">

                <div className="ai-icon">

                  <Sparkles size={17} />

                </div>


                <h2>
                  QuantExa AI
                </h2>


                <span>
                  BETA
                </span>

              </div>


              <ExternalLink size={16} />

            </div>


            <form
              className="ai-input"
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSubmit();
              }}
            >

              <MessageCircle size={17} />

              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask about markets, strategies, or data..."
                disabled={aiLoading}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  flex: 1,
                  color: "#1e293b",
                  fontSize: "13px",
                  fontWeight: 500,
                  width: "100%",
                }}
              />

              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                aria-label="Send Query"
              >
                {aiLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </button>

            </form>

            {/* LOADING STATE */}
            {aiLoading && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#f0f7ff",
                  border: "1px solid #d0e3ff",
                  color: "#2878ff",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <RefreshCw size={14} className="animate-spin" />
                <span>QuantExa AI Research Engine processing query...</span>
              </div>
            )}

            {/* ERROR STATE */}
            {aiError && !aiLoading && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                {aiError}
              </div>
            )}

            {/* SUCCESS STATE */}
            {aiResponse && !aiLoading && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#2878ff",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "6px",
                  }}
                >
                  AI Research Output ({aiResponse.intent || "General"})
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#334155",
                    lineHeight: "1.5",
                    margin: "0 0 8px 0",
                  }}
                >
                  {aiResponse.explanation}
                </p>

                {aiResponse.calculated_results &&
                  aiResponse.calculated_results.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      {aiResponse.calculated_results.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: "12px",
                            color: "#1e293b",
                            fontWeight: 600,
                            marginTop: "2px",
                          }}
                        >
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}

                {aiResponse.disclaimer && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      fontStyle: "italic",
                      marginTop: "6px",
                    }}
                  >
                    {aiResponse.disclaimer}
                  </div>
                )}
              </div>
            )}

            <p className="ai-suggestions-label">
              Try asking:
            </p>

            <div className="ai-suggestions">

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => {
                  setAiQuery("Why is gold rising?");
                  handleAiSubmit("Why is gold rising?");
                }}
              >
                Why is gold rising?
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => {
                  setAiQuery("Analyze BTC correlation");
                  handleAiSubmit("Analyze BTC correlation");
                }}
              >
                Analyze BTC correlation
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => {
                  setAiQuery("Suggest a strategy for current regime");
                  handleAiSubmit("Suggest a strategy for current regime");
                }}
              >
                Suggest a strategy for current regime
              </button>

            </div>

          </section>

        </aside>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="dashboard-footer">

        <span>
          © 2026 QuantExa. Accelerating quantitative research.
        </span>


        <div>

          <a href="#">
            Documentation
          </a>

          <a href="#">
            Help
          </a>

          <a href="#">
            Privacy
          </a>

          <a href="#">
            Terms
          </a>

        </div>

      </footer>

    </div>
  );
}

"use client";

import AssetCard from "@/components/dashboard/AssetCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import PortfolioCard from "@/components/dashboard/PortfolioCard";

import {
  allocation,
  assets,
  insights,
  marketRegime,
  portfolio,
  topMovers,
} from "@/lib/mockMarketData";

import { useCurrency } from "@/components/CurrencyProvider";

import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock3,
  ExternalLink,
  Lightbulb,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function Home() {

  const { formatAmount } = useCurrency();

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

            {assets.map((asset) => (

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


            <div className="ai-input">

              <MessageCircle size={17} />

              <span>
                Ask about markets, strategies, or data...
              </span>


              <button>

                <ArrowUpRight size={16} />

              </button>

            </div>


            <p className="ai-suggestions-label">
              Try asking:
            </p>


            <div className="ai-suggestions">

              <button>
                Why is gold rising?
              </button>

              <button>
                Analyze BTC correlation
              </button>

              <button>
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
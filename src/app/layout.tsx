import type { Metadata } from "next";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { CurrencyProvider } from "@/components/CurrencyProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "QuantExa — Quantitative Research",
  description:
    "QuantExa quantitative multi-asset financial intelligence and backtesting platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CurrencyProvider>
            <div className="app-shell">
              <Sidebar />

              <div className="main-shell">
                <Topbar />

                <main className="main-content">
                  {children}
                </main>
              </div>
            </div>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
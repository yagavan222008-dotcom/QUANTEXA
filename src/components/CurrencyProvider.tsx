"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Currency,
  currencies,
  defaultCurrency,
  getCurrency,
} from "@/lib/currencies";

type CurrencyContextType = {
  currency: Currency;

  setCurrency: (code: string) => void;

  convertAmount: (
    amount: number,
    fromCurrency?: string
  ) => number;

  formatAmount: (
    amount: number,
    decimals?: number,
    fromCurrency?: string
  ) => string;
};

const CurrencyContext = createContext<
  CurrencyContextType | undefined
>(undefined);

/*
 * TEMPORARY FX RATES
 *
 * Base currency = USD
 *
 * These are temporary frontend values so that
 * the currency system can work before the backend
 * FX service is connected.
 *
 * Later, the backend will provide live exchange rates.
 */
const FX_RATES: Record<string, number> = {
  USD: 1,

  EUR: 0.85,
  JPY: 148,
  GBP: 0.74,
  CNY: 7.1,
  CHF: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  HKD: 7.8,
  SGD: 1.29,

  INR: 83.5,
  KRW: 1390,
  NZD: 1.65,
  SEK: 10.8,
  NOK: 11.0,
  DKK: 6.35,
  PLN: 3.95,
  CZK: 21.5,
  HUF: 365,
  TRY: 34.5,
  ZAR: 18.2,
  BRL: 5.4,
  MXN: 18.8,
  AED: 3.67,
  SAR: 3.75,
  ILS: 3.65,
  THB: 33.5,
  MYR: 4.7,
  IDR: 15500,
  PHP: 56.5,
  VND: 24500,
  PKR: 278,
  BDT: 117,
  LKR: 300,
};

export function CurrencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currencyCode, setCurrencyCode] = useState(
    defaultCurrency.code
  );

  useEffect(() => {
    const savedCurrency = localStorage.getItem(
      "quantexa-currency"
    );

    if (
      savedCurrency &&
      currencies.some(
        (currency) => currency.code === savedCurrency
      )
    ) {
      setCurrencyCode(savedCurrency);
    }
  }, []);

  const currency = useMemo(
    () => getCurrency(currencyCode),
    [currencyCode]
  );

  function setCurrency(code: string) {
    setCurrencyCode(code);

    localStorage.setItem(
      "quantexa-currency",
      code
    );
  }

  function convertAmount(
    amount: number,
    fromCurrency = "USD"
  ) {
    if (fromCurrency === currency.code) {
      return amount;
    }

    const fromRate =
      FX_RATES[fromCurrency] ?? 1;

    const toRate =
      FX_RATES[currency.code] ?? 1;

    /*
     * Convert:
     *
     * source currency
     *       ↓
     * USD
     *       ↓
     * selected currency
     */
    const amountInUSD =
      amount / fromRate;

    return amountInUSD * toRate;
  }

  function formatAmount(
    amount: number,
    decimals = 2,
    fromCurrency = "USD"
  ) {
    const convertedAmount =
      convertAmount(
        amount,
        fromCurrency
      );

    return new Intl.NumberFormat(
      currency.locale,
      {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }
    ).format(convertedAmount);
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertAmount,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context =
    useContext(CurrencyContext);

  if (!context) {
    throw new Error(
      "useCurrency must be used inside CurrencyProvider"
    );
  }

  return context;
}


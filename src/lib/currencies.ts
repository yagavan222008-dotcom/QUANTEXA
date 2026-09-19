export type Currency = {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
};

export const currencies: Currency[] = [
  // =========================================================
  // TOP 10 — SHOWN FIRST
  // =========================================================

  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    flag: "🇺🇸",
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
    flag: "🇪🇺",
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    locale: "ja-JP",
    flag: "🇯🇵",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
    flag: "🇬🇧",
  },
  {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    locale: "zh-CN",
    flag: "🇨🇳",
  },
  {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    locale: "de-CH",
    flag: "🇨🇭",
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    locale: "en-CA",
    flag: "🇨🇦",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    locale: "en-AU",
    flag: "🇦🇺",
  },
  {
    code: "HKD",
    symbol: "HK$",
    name: "Hong Kong Dollar",
    locale: "zh-HK",
    flag: "🇭🇰",
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    locale: "en-SG",
    flag: "🇸🇬",
  },

  // =========================================================
  // OTHER MAJOR CURRENCIES
  // =========================================================

  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    locale: "en-IN",
    flag: "🇮🇳",
  },
  {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    locale: "ko-KR",
    flag: "🇰🇷",
  },
  {
    code: "NZD",
    symbol: "NZ$",
    name: "New Zealand Dollar",
    locale: "en-NZ",
    flag: "🇳🇿",
  },
  {
    code: "SEK",
    symbol: "kr",
    name: "Swedish Krona",
    locale: "sv-SE",
    flag: "🇸🇪",
  },
  {
    code: "NOK",
    symbol: "kr",
    name: "Norwegian Krone",
    locale: "nb-NO",
    flag: "🇳🇴",
  },
  {
    code: "DKK",
    symbol: "kr",
    name: "Danish Krone",
    locale: "da-DK",
    flag: "🇩🇰",
  },
  {
    code: "PLN",
    symbol: "zł",
    name: "Polish Zloty",
    locale: "pl-PL",
    flag: "🇵🇱",
  },
  {
    code: "CZK",
    symbol: "Kč",
    name: "Czech Koruna",
    locale: "cs-CZ",
    flag: "🇨🇿",
  },
  {
    code: "HUF",
    symbol: "Ft",
    name: "Hungarian Forint",
    locale: "hu-HU",
    flag: "🇭🇺",
  },
  {
    code: "TRY",
    symbol: "₺",
    name: "Turkish Lira",
    locale: "tr-TR",
    flag: "🇹🇷",
  },
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    locale: "en-ZA",
    flag: "🇿🇦",
  },
  {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    locale: "pt-BR",
    flag: "🇧🇷",
  },
  {
    code: "MXN",
    symbol: "MX$",
    name: "Mexican Peso",
    locale: "es-MX",
    flag: "🇲🇽",
  },
  {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    locale: "ar-AE",
    flag: "🇦🇪",
  },
  {
    code: "SAR",
    symbol: "﷼",
    name: "Saudi Riyal",
    locale: "ar-SA",
    flag: "🇸🇦",
  },
  {
    code: "ILS",
    symbol: "₪",
    name: "Israeli New Shekel",
    locale: "he-IL",
    flag: "🇮🇱",
  },
  {
    code: "THB",
    symbol: "฿",
    name: "Thai Baht",
    locale: "th-TH",
    flag: "🇹🇭",
  },
  {
    code: "MYR",
    symbol: "RM",
    name: "Malaysian Ringgit",
    locale: "ms-MY",
    flag: "🇲🇾",
  },
  {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    locale: "id-ID",
    flag: "🇮🇩",
  },
  {
    code: "PHP",
    symbol: "₱",
    name: "Philippine Peso",
    locale: "en-PH",
    flag: "🇵🇭",
  },
  {
    code: "VND",
    symbol: "₫",
    name: "Vietnamese Dong",
    locale: "vi-VN",
    flag: "🇻🇳",
  },
  {
    code: "PKR",
    symbol: "₨",
    name: "Pakistani Rupee",
    locale: "ur-PK",
    flag: "🇵🇰",
  },
  {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    locale: "bn-BD",
    flag: "🇧🇩",
  },
  {
    code: "LKR",
    symbol: "Rs",
    name: "Sri Lankan Rupee",
    locale: "en-LK",
    flag: "🇱🇰",
  },
];

export const defaultCurrency = currencies.find(
  (currency) => currency.code === "USD"
)!;

export function getCurrency(code: string): Currency {
  return (
    currencies.find((currency) => currency.code === code) ??
    defaultCurrency
  );
}
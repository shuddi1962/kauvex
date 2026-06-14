export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
  isDefault: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", decimalPlaces: 2, isDefault: true },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG", decimalPlaces: 2, isDefault: false },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", decimalPlaces: 2, isDefault: false },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", decimalPlaces: 2, isDefault: false },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", decimalPlaces: 2, isDefault: false },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE", decimalPlaces: 2, isDefault: false },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", decimalPlaces: 2, isDefault: false },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", decimalPlaces: 2, isDefault: false },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", locale: "en-KE", decimalPlaces: 2, isDefault: false },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", locale: "en-GH", decimalPlaces: 2, isDefault: false },
  { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA", decimalPlaces: 2, isDefault: false },
];

export const STOREFRONT_CURRENCY_MAP: Record<string, string> = {
  "kauvex": "USD",
  "uk": "GBP",
  "ca": "CAD",
  "au": "AUD",
  "ng": "NGN",
  "ke": "KES",
  "gh": "GHS",
  "za": "ZAR",
};

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "US": "USD", "NG": "NGN", "GB": "GBP", "CA": "CAD", "AU": "AUD",
  "DE": "EUR", "FR": "EUR", "IT": "EUR", "ES": "EUR", "NL": "EUR",
  "AE": "AED", "IN": "INR", "KE": "KES", "GH": "GHS", "ZA": "ZAR",
};

const exchangeRates: Record<string, Record<string, number>> = {
  "USD": { "NGN": 1540, "GBP": 0.79, "EUR": 0.92, "CAD": 1.36, "AED": 3.67, "INR": 83.2, "AUD": 1.52, "KES": 130, "GHS": 12.5, "ZAR": 18.5 },
  "NGN": { "USD": 0.00065, "GBP": 0.00051, "EUR": 0.00060, "CAD": 0.00088, "AED": 0.0024, "INR": 0.054, "AUD": 0.00099, "KES": 0.084, "GHS": 0.0081, "ZAR": 0.012 },
};

export function getCurrencyByStorefront(storefrontSlug: string): CurrencyConfig {
  const code = STOREFRONT_CURRENCY_MAP[storefrontSlug] || "USD";
  return getCurrencyConfig(code);
}

export function getCurrencyByCountry(countryCode: string): CurrencyConfig {
  const code = COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || "USD";
  return getCurrencyConfig(code);
}

export function getCurrencyConfig(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  const config = getCurrencyConfig(currencyCode);
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(config.decimalPlaces)}`;
  }
}

export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return 1;
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  return exchangeRates[from]?.[to] || exchangeRates[to]?.[from] || 1;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return Math.round(amount * rate * 100) / 100;
}

export function getDisplayCurrencies(): string[] {
  return SUPPORTED_CURRENCIES.map((c) => c.code);
}

export function isCurrencySupported(code: string): boolean {
  return SUPPORTED_CURRENCIES.some((c) => c.code === code.toUpperCase());
}

export function calculateGatewayFee(
  amount: number,
  gatewayCode: string,
  currency: string = "USD"
): { fee: number; netAmount: number; percentage: number; fixed: number } {
  const gatewayFees: Record<string, { percentage: number; fixed: number }> = {
    stripe: { percentage: 2.9, fixed: 0.30 },
    paystack: { percentage: 1.5, fixed: 0 },
    flutterwave: { percentage: 1.4, fixed: 0 },
    paypal: { percentage: 3.5, fixed: 0.49 },
    apple_pay: { percentage: 0, fixed: 0 },
    google_pay: { percentage: 0, fixed: 0 },
    bank_transfer: { percentage: 0, fixed: 0 },
  };

  const config = gatewayFees[gatewayCode.toLowerCase()] || { percentage: 2.9, fixed: 0 };
  const percentageFee = amount * (config.percentage / 100);
  const totalFee = percentageFee + config.fixed;
  const netAmount = amount - totalFee;

  return {
    fee: Math.round(totalFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    percentage: config.percentage,
    fixed: config.fixed,
  };
}

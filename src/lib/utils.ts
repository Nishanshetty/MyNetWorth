import type { CurrencyInfo } from './types'

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar',          symbol: '$'    },
  { code: 'EUR', name: 'Euro',               symbol: '€'    },
  { code: 'GBP', name: 'British Pound',      symbol: '£'    },
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹'    },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$'   },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'C$'   },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥'    },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr'   },
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$'   },
  { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ'  },
  { code: 'HKD', name: 'Hong Kong Dollar',   symbol: 'HK$'  },
  { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$'  },
  { code: 'THB', name: 'Thai Baht',          symbol: '฿'    },
]

// Default rates relative to USD (1 unit of currency = N USD)
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
  AUD: 0.65,
  CAD: 0.73,
  JPY: 0.0065,
  CHF: 1.12,
  SGD: 0.74,
  AED: 0.27,
  HKD: 0.13,
  MXN: 0.052,
  THB: 0.028,
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  return (
    SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? {
      code,
      name: code,
      symbol: code,
    }
  )
}

// When the user switches base currency, recompute all stored rates so they
// remain consistent: rates[c] = "N new-base units per 1 unit of c"
export function rebaseRates(
  rates: Record<string, number>,
  oldBase: string,
  newBase: string,
): Record<string, number> {
  if (oldBase === newBase) return rates

  // How many old-base units equal 1 new-base unit
  const newBaseInOldBase = rates[newBase] ?? DEFAULT_EXCHANGE_RATES[newBase] ?? 1

  const result: Record<string, number> = {}
  for (const [code, rate] of Object.entries(rates)) {
    if (code === newBase) continue
    result[code] = rate / newBaseInOldBase
  }
  // The old base becomes a foreign currency in the new context
  result[oldBase] = 1 / newBaseInOldBase

  return result
}

// ─── Formatting ──────────────────────────────────────────────

const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', INR: 'en-IN',
  AUD: 'en-AU', CAD: 'en-CA', JPY: 'ja-JP', CHF: 'de-CH',
  SGD: 'en-SG', AED: 'ar-AE', HKD: 'zh-HK', MXN: 'es-MX', THB: 'th-TH',
}

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string): Intl.NumberFormat {
  if (!formatterCache.has(currency)) {
    formatterCache.set(
      currency,
      new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    )
  }
  return formatterCache.get(currency)!
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return getFormatter(currency).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

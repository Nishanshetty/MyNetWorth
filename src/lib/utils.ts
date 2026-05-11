import type { Currency } from './types'

const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
}

// Cache formatters — Intl.NumberFormat construction is expensive
const formatterCache = new Map<Currency, Intl.NumberFormat>()

function getFormatter(currency: Currency): Intl.NumberFormat {
  if (!formatterCache.has(currency)) {
    formatterCache.set(
      currency,
      new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    )
  }
  return formatterCache.get(currency)!
}

export function formatCurrency(amount: number, currency: Currency): string {
  return getFormatter(currency).format(amount)
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

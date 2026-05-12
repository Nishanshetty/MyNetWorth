import type { FinancialData } from './types'
import { DEFAULT_DATA, } from './defaults'
import { DEFAULT_EXCHANGE_RATES } from './utils'

const KEY = 'mynetworth_v1'
const MAX_IMPORT_BYTES = 512 * 1024

export function loadData(): FinancialData {
  if (typeof window === 'undefined') return DEFAULT_DATA
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULT_DATA)
    const parsed = JSON.parse(raw) as Partial<FinancialData>
    const data: FinancialData = { ...structuredClone(DEFAULT_DATA), ...parsed }
    // Migration: ensure every line item has a currency field
    const base = data.currency
    const migrate = <T extends { currency?: string }>(items: T[]): T[] =>
      items.map((item) => ({ ...item, currency: item.currency ?? base }))
    data.assets      = migrate(data.assets)
    data.liabilities = migrate(data.liabilities)
    data.income      = migrate(data.income)
    data.expenses    = migrate(data.expenses)
    data.cashFlows   = migrate(data.cashFlows)
    // Migration: ensure exchangeRates exists
    if (!data.exchangeRates || typeof data.exchangeRates !== 'object') {
      data.exchangeRates = { ...DEFAULT_EXCHANGE_RATES }
    }
    return data
  } catch {
    return structuredClone(DEFAULT_DATA)
  }
}

export function saveData(data: FinancialData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function exportJSON(data: FinancialData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mynetworth-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(file: File): Promise<FinancialData> {
  if (file.size > MAX_IMPORT_BYTES) {
    return Promise.reject(new Error('File is too large to be a valid backup (max 512 KB)'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as Partial<FinancialData>
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Invalid shape')
        }
        const data: FinancialData = { ...structuredClone(DEFAULT_DATA), ...parsed }
        const base = data.currency
        const migrate = <T extends { currency?: string }>(items: T[]): T[] =>
          items.map((item) => ({ ...item, currency: item.currency ?? base }))
        data.assets      = migrate(data.assets)
        data.liabilities = migrate(data.liabilities)
        data.income      = migrate(data.income)
        data.expenses    = migrate(data.expenses)
        data.cashFlows   = migrate(data.cashFlows)
        resolve(data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

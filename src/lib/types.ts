// Currency is now a plain string (any ISO 4217 code) for flexibility
export type Currency = string

export type Tab = 'balance-sheet' | 'income' | 'cash-flow' | 'calculator' | 'preview'

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
}

export interface LineItem {
  id: string
  label: string
  amount: number
  currency: string
}

export interface CashFlowItem {
  id: string
  type: 'inflow' | 'outflow'
  label: string
  amount: number
  currency: string
}

export interface FinancialData {
  version: number
  userName: string
  currency: string        // base/display currency
  darkMode: boolean
  // rate[code] = how many base-currency units equal 1 unit of `code`
  // e.g. base=USD, EUR→1.08 means 1 EUR = 1.08 USD
  exchangeRates: Record<string, number>
  assets: LineItem[]
  liabilities: LineItem[]
  income: LineItem[]
  expenses: LineItem[]
  cashFlows: CashFlowItem[]
  calculator: import('./calculator').CalculatorState
}

export interface Metrics {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number | null
  debtToAssetRatio: number | null
  netCashFlow: number
}

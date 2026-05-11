export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR'

export type Tab = 'balance-sheet' | 'income' | 'cash-flow' | 'preview'

export interface LineItem {
  id: string
  label: string
  amount: number
}

export interface CashFlowItem {
  id: string
  type: 'inflow' | 'outflow'
  label: string
  amount: number
}

export interface FinancialData {
  version: number
  userName: string
  currency: Currency
  darkMode: boolean
  assets: LineItem[]
  liabilities: LineItem[]
  income: LineItem[]
  expenses: LineItem[]
  cashFlows: CashFlowItem[]
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

import type { FinancialData, Metrics } from './types'

export function calculateMetrics(data: FinancialData): Metrics {
  const totalAssets = data.assets.reduce((s, r) => s + (r.amount || 0), 0)
  const totalLiabilities = data.liabilities.reduce((s, r) => s + (r.amount || 0), 0)
  const netWorth = totalAssets - totalLiabilities

  const totalIncome = data.income.reduce((s, r) => s + (r.amount || 0), 0)
  const totalExpenses = data.expenses.reduce((s, r) => s + (r.amount || 0), 0)
  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : null

  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : null

  const inflows = data.cashFlows
    .filter((r) => r.type === 'inflow')
    .reduce((s, r) => s + (r.amount || 0), 0)
  const outflows = data.cashFlows
    .filter((r) => r.type === 'outflow')
    .reduce((s, r) => s + (r.amount || 0), 0)
  const netCashFlow = inflows - outflows

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    totalIncome,
    totalExpenses,
    netIncome,
    savingsRate,
    debtToAssetRatio,
    netCashFlow,
  }
}

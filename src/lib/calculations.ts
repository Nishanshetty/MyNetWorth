import type { FinancialData, Metrics } from './types'

function toBase(
  amount: number,
  itemCurrency: string,
  base: string,
  rates: Record<string, number>,
): number {
  if (!itemCurrency || itemCurrency === base) return amount
  const rate = rates[itemCurrency] ?? 1
  return amount * rate
}

export function calculateMetrics(data: FinancialData): Metrics {
  const { currency: base, exchangeRates: rates } = data

  const totalAssets = data.assets.reduce(
    (s, r) => s + toBase(r.amount || 0, r.currency ?? base, base, rates), 0)
  const totalLiabilities = data.liabilities.reduce(
    (s, r) => s + toBase(r.amount || 0, r.currency ?? base, base, rates), 0)
  const netWorth = totalAssets - totalLiabilities

  const totalIncome = data.income.reduce(
    (s, r) => s + toBase(r.amount || 0, r.currency ?? base, base, rates), 0)
  const totalExpenses = data.expenses.reduce(
    (s, r) => s + toBase(r.amount || 0, r.currency ?? base, base, rates), 0)
  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : null
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : null

  let inflows = 0
  let outflows = 0
  for (const r of data.cashFlows) {
    const converted = toBase(r.amount || 0, r.currency ?? base, base, rates)
    if (r.type === 'inflow') inflows += converted
    else outflows += converted
  }
  const netCashFlow = inflows - outflows

  return {
    totalAssets, totalLiabilities, netWorth,
    totalIncome, totalExpenses, netIncome,
    savingsRate, debtToAssetRatio, netCashFlow,
  }
}

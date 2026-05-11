'use client'

import type { Metrics, Currency } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  positive: boolean | null
  description?: string
}

function StatCard({ label, value, positive, description }: StatCardProps) {
  const colorClass =
    positive === null
      ? 'text-gray-800 dark:text-gray-100'
      : positive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-500 dark:text-red-400'

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className={`text-xl font-semibold tabular-nums ${colorClass}`}>{value}</span>
      {description && (
        <span className="text-xs text-gray-400 dark:text-gray-500">{description}</span>
      )}
    </div>
  )
}

interface Props {
  metrics: Metrics
  currency: Currency
}

export default function SummaryDashboard({ metrics, currency }: Props) {
  const { netWorth, netIncome, savingsRate, debtToAssetRatio } = metrics

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Net worth"
        value={formatCurrency(netWorth, currency)}
        positive={netWorth === 0 ? null : netWorth > 0}
      />
      <StatCard
        label="Monthly net income"
        value={formatCurrency(netIncome, currency)}
        positive={netIncome === 0 ? null : netIncome > 0}
      />
      <StatCard
        label="Savings rate"
        value={savingsRate === null ? '—' : formatPercent(savingsRate)}
        positive={savingsRate === null ? null : savingsRate >= 20}
        description={savingsRate !== null && savingsRate < 20 ? 'aim for 20%+' : undefined}
      />
      <StatCard
        label="Debt-to-asset"
        value={debtToAssetRatio === null ? '—' : formatPercent(debtToAssetRatio)}
        positive={debtToAssetRatio === null ? null : debtToAssetRatio < 50}
        description={debtToAssetRatio !== null && debtToAssetRatio >= 50 ? 'high — aim below 50%' : undefined}
      />
    </div>
  )
}

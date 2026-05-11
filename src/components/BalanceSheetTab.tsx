'use client'

import SectionCard from './SectionCard'
import type { FinancialData, Metrics } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: FinancialData
  metrics: Metrics
  onChange: (data: Partial<FinancialData>) => void
}

export default function BalanceSheetTab({ data, metrics, onChange }: Props) {
  const netWorthColor =
    metrics.netWorth > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : metrics.netWorth < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-700 dark:text-gray-300'

  return (
    <div className="space-y-4">
      <SectionCard
        title="Assets"
        items={data.assets}
        total={metrics.totalAssets}
        totalLabel="Total assets"
        currency={data.currency}
        accentColor="green"
        onChange={(assets) => onChange({ assets })}
      />
      <SectionCard
        title="Liabilities"
        items={data.liabilities}
        total={metrics.totalLiabilities}
        totalLabel="Total liabilities"
        currency={data.currency}
        accentColor="red"
        onChange={(liabilities) => onChange({ liabilities })}
      />

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <span className="font-semibold text-gray-700 dark:text-gray-200">Net worth</span>
        <span className={`text-lg font-bold tabular-nums ${netWorthColor}`}>
          {formatCurrency(metrics.netWorth, data.currency)}
        </span>
      </div>
    </div>
  )
}

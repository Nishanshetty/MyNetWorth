'use client'

import SectionCard from './SectionCard'
import type { FinancialData, Metrics } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface Props {
  data: FinancialData
  metrics: Metrics
  onChange: (data: Partial<FinancialData>) => void
}

export default function IncomeStatementTab({ data, metrics, onChange }: Props) {
  const netColor =
    metrics.netIncome > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : metrics.netIncome < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-700 dark:text-gray-300'

  return (
    <div className="space-y-4">
      <SectionCard
        title="Monthly income"
        items={data.income}
        total={metrics.totalIncome}
        totalLabel="Total income"
        currency={data.currency}
        accentColor="green"
        onChange={(income) => onChange({ income })}
      />
      <SectionCard
        title="Monthly expenses"
        items={data.expenses}
        total={metrics.totalExpenses}
        totalLabel="Total expenses"
        currency={data.currency}
        accentColor="red"
        onChange={(expenses) => onChange({ expenses })}
      />

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Net income</span>
          <span className={`text-lg font-bold tabular-nums ${netColor}`}>
            {formatCurrency(metrics.netIncome, data.currency)}
          </span>
        </div>
        {metrics.savingsRate !== null && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Savings rate</span>
            <span
              className={`text-sm font-medium tabular-nums ${
                metrics.savingsRate >= 20
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-500 dark:text-amber-400'
              }`}
            >
              {formatPercent(metrics.savingsRate)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

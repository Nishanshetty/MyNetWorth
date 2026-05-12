'use client'

import { Plus } from 'lucide-react'
import CashFlowRow from './CashFlowRow'
import type { FinancialData, Metrics, CashFlowItem } from '@/lib/types'
import { formatCurrency, uid } from '@/lib/utils'

interface Props {
  data: FinancialData
  metrics: Metrics
  onChange: (data: Partial<FinancialData>) => void
}

export default function CashFlowTab({ data, metrics, onChange }: Props) {
  const base = data.currency

  function handleChange(id: string, field: 'type' | 'label' | 'amount' | 'currency', value: string | number) {
    onChange({
      cashFlows: data.cashFlows.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    })
  }

  function handleDelete(id: string) {
    onChange({ cashFlows: data.cashFlows.filter((item) => item.id !== id) })
  }

  function handleAdd(type: CashFlowItem['type']) {
    onChange({
      cashFlows: [...data.cashFlows, { id: uid(), type, label: '', amount: 0, currency: base }],
    })
  }

  const netColor =
    metrics.netCashFlow > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : metrics.netCashFlow < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-700 dark:text-gray-300'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Cash movements
        </h3>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.cashFlows.map((item) => (
            <CashFlowRow
              key={item.id}
              item={item}
              baseCurrency={base}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleAdd('inflow')}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-emerald-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
          >
            <Plus size={12} />
            Add inflow
          </button>
          <button
            onClick={() => handleAdd('outflow')}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <Plus size={12} />
            Add outflow
          </button>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total inflows</span>
            <span className="text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(
                data.cashFlows
                  .filter((r) => r.type === 'inflow')
                  .reduce((s, r) => {
                    const rate = r.currency === base ? 1 : (data.exchangeRates[r.currency] ?? 1)
                    return s + r.amount * rate
                  }, 0),
                base,
              )}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total outflows</span>
            <span className="text-sm tabular-nums text-red-500 dark:text-red-400">
              {formatCurrency(
                data.cashFlows
                  .filter((r) => r.type === 'outflow')
                  .reduce((s, r) => {
                    const rate = r.currency === base ? 1 : (data.exchangeRates[r.currency] ?? 1)
                    return s + r.amount * rate
                  }, 0),
                base,
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <span className="font-semibold text-gray-700 dark:text-gray-200">Net cash flow</span>
        <span className={`text-lg font-bold tabular-nums ${netColor}`}>
          {formatCurrency(metrics.netCashFlow, base)}
        </span>
      </div>
    </div>
  )
}

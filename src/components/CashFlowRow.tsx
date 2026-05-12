'use client'

import { Trash2 } from 'lucide-react'
import type { CashFlowItem } from '@/lib/types'
import { SUPPORTED_CURRENCIES, getCurrencyInfo } from '@/lib/utils'

interface Props {
  item: CashFlowItem
  baseCurrency: string
  onChange: (id: string, field: 'type' | 'label' | 'amount' | 'currency', value: string | number) => void
  onDelete: (id: string) => void
}

export default function CashFlowRow({ item, baseCurrency, onChange, onDelete }: Props) {
  const itemCurrency = item.currency ?? baseCurrency
  const symbol = getCurrencyInfo(itemCurrency).symbol

  return (
    <div className="group flex items-center gap-2 py-1.5">
      <select
        value={item.type}
        onChange={(e) => onChange(item.id, 'type', e.target.value)}
        className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:border-gray-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      >
        <option value="inflow">inflow</option>
        <option value="outflow">outflow</option>
      </select>
      <input
        type="text"
        value={item.label}
        onChange={(e) => onChange(item.id, 'label', e.target.value)}
        placeholder="Description"
        className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-gray-800 placeholder-gray-400 transition-colors hover:border-gray-200 focus:border-gray-300 focus:bg-white focus:outline-none dark:text-gray-200 dark:placeholder-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-500 dark:focus:bg-gray-800"
      />
      <div className="flex items-center rounded border border-transparent bg-transparent transition-colors hover:border-gray-200 focus-within:border-gray-300 focus-within:bg-white dark:hover:border-gray-600 dark:focus-within:border-gray-500 dark:focus-within:bg-gray-800">
        <span className="pl-2 text-sm text-gray-400 dark:text-gray-500">{symbol}</span>
        <input
          type="number"
          value={item.amount === 0 ? '' : item.amount}
          onChange={(e) => onChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min={0}
          className="w-24 rounded bg-transparent px-2 py-1 text-right text-sm text-gray-800 focus:outline-none dark:text-gray-200"
        />
      </div>
      <select
        value={itemCurrency}
        onChange={(e) => onChange(item.id, 'currency', e.target.value)}
        aria-label="Item currency"
        className={`rounded border px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 ${
          itemCurrency !== baseCurrency
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
            : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
      <button
        onClick={() => onDelete(item.id)}
        aria-label="Delete row"
        className="rounded p-1 text-gray-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

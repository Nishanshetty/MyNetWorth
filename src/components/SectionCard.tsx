'use client'

import { Plus } from 'lucide-react'
import EditableRow from './EditableRow'
import type { LineItem, Currency } from '@/lib/types'
import { formatCurrency, uid } from '@/lib/utils'

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
}

interface Props {
  title: string
  items: LineItem[]
  total: number
  totalLabel: string
  currency: Currency
  accentColor?: 'green' | 'red' | 'blue'
  onChange: (items: LineItem[]) => void
}

export default function SectionCard({
  title,
  items,
  total,
  totalLabel,
  currency,
  accentColor = 'blue',
  onChange,
}: Props) {
  const symbol = CURRENCY_SYMBOLS[currency]

  function handleChange(id: string, field: 'label' | 'amount', value: string | number) {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  function handleDelete(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function handleAdd() {
    onChange([...items, { id: uid(), label: '', amount: 0 }])
  }

  const accentMap = {
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-500 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h3>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.map((item) => (
          <EditableRow
            key={item.id}
            item={item}
            onChange={handleChange}
            onDelete={handleDelete}
            currencySymbol={symbol}
          />
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="mt-2 flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <Plus size={12} />
        Add row
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{totalLabel}</span>
        <span className={`text-sm font-semibold tabular-nums ${accentMap[accentColor]}`}>
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  )
}

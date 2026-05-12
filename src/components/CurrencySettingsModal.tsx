'use client'

import { X, ExternalLink } from 'lucide-react'
import type { FinancialData } from '@/lib/types'
import { SUPPORTED_CURRENCIES, getCurrencyInfo, rebaseRates } from '@/lib/utils'

interface Props {
  data: FinancialData
  onClose: () => void
  onChange: (patch: Partial<FinancialData>) => void
}

function getUsedForeignCurrencies(data: FinancialData): string[] {
  const all = [
    ...data.assets,
    ...data.liabilities,
    ...data.income,
    ...data.expenses,
    ...data.cashFlows,
  ].map((item) => item.currency ?? data.currency)

  return [...new Set(all)].filter((c) => c !== data.currency)
}

export default function CurrencySettingsModal({ data, onClose, onChange }: Props) {
  const foreign = getUsedForeignCurrencies(data)

  function handleBaseChange(newBase: string) {
    if (newBase === data.currency) return
    const newRates = rebaseRates(data.exchangeRates, data.currency, newBase)
    onChange({ currency: newBase, exchangeRates: newRates })
  }

  function handleRateChange(code: string, raw: string) {
    const value = parseFloat(raw)
    if (isNaN(value) || value <= 0) return
    onChange({ exchangeRates: { ...data.exchangeRates, [code]: value } })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Currency settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Base currency */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Base / display currency
            </label>
            <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
              All totals and statements are shown in this currency. Switching recalculates exchange rates automatically.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SUPPORTED_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleBaseChange(c.code)}
                  className={`flex flex-col rounded-lg border px-3 py-2 text-left transition-colors ${
                    data.currency === c.code
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-sm font-semibold">{c.code}</span>
                  <span className={`text-xs ${data.currency === c.code ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {c.symbol} · {c.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Exchange rates */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Exchange rates
            </label>
            {foreign.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                No foreign currencies in use yet. Change a line item&apos;s currency to see its rate here.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Currency</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                        Rate (1 unit = ? {data.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {foreign.map((code) => {
                      const info = getCurrencyInfo(code)
                      const rate = data.exchangeRates[code] ?? 1
                      return (
                        <tr key={code} className="bg-white dark:bg-gray-900">
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{code}</span>
                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{info.name}</span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              defaultValue={rate}
                              key={`${code}-${rate}`}
                              onBlur={(e) => handleRateChange(code, e.target.value)}
                              min={0.000001}
                              step="any"
                              className="w-28 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-right text-sm tabular-nums text-gray-800 focus:border-gray-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-gray-500 dark:focus:bg-gray-700"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Rates are manual — update monthly for accuracy.{' '}
              <a
                href="https://www.xe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline hover:text-gray-600 dark:hover:text-gray-300"
              >
                xe.com <ExternalLink size={10} />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

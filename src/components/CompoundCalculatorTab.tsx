'use client'

import { useMemo } from 'react'
import { Info } from 'lucide-react'
import GrowthChart from './GrowthChart'
import type { FinancialData } from '@/lib/types'
import type { CalculatorState } from '@/lib/calculator'
import { FREQUENCY_OPTIONS, calculateGrowth } from '@/lib/calculator'
import { formatCurrency, getCurrencyInfo } from '@/lib/utils'

interface Props {
  data: FinancialData
  onChange: (patch: Partial<FinancialData>) => void
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {hint && (
          <span title={hint} className="cursor-help text-gray-400 dark:text-gray-500">
            <Info size={11} />
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-gray-500'

export default function CompoundCalculatorTab({ data, onChange }: Props) {
  const calc = data.calculator
  const base = data.currency
  const symbol = getCurrencyInfo(base).symbol

  function set(patch: Partial<CalculatorState>) {
    onChange({ calculator: { ...calc, ...patch } })
  }

  // Effective principal: in BS mode, derived from selected assets
  const bsPrincipal = useMemo(() => {
    return data.assets
      .filter((a) => calc.selectedAssetIds.includes(a.id))
      .reduce((sum, a) => {
        const rate = a.currency === base ? 1 : (data.exchangeRates[a.currency] ?? 1)
        return sum + (a.amount || 0) * rate
      }, 0)
  }, [calc.selectedAssetIds, data.assets, data.exchangeRates, base])

  function toggleAsset(id: string) {
    const newIds = calc.selectedAssetIds.includes(id)
      ? calc.selectedAssetIds.filter((x) => x !== id)
      : [...calc.selectedAssetIds, id]
    const newPrincipal = data.assets
      .filter((a) => newIds.includes(a.id))
      .reduce((sum, a) => {
        const rate = a.currency === base ? 1 : (data.exchangeRates[a.currency] ?? 1)
        return sum + (a.amount || 0) * rate
      }, 0)
    set({ selectedAssetIds: newIds, principal: Math.round(newPrincipal) })
  }

  const effectivePrincipal = calc.mode === 'balance-sheet' ? calc.principal : calc.principal
  const growthData = useMemo(
    () => calculateGrowth({ ...calc, principal: effectivePrincipal }),
    [calc, effectivePrincipal],
  )

  const finalYear = growthData[growthData.length - 1]
  const totalContributions = (calc.monthlyContribution * calc.years * 12) + calc.principal
  const totalInterest = finalYear ? finalYear.balance - totalContributions : 0
  const multiplier = calc.principal > 0 && finalYear ? finalYear.balance / calc.principal : null

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="no-print flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
        {(['manual', 'balance-sheet'] as const).map((m) => (
          <button
            key={m}
            onClick={() => set({ mode: m })}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              calc.mode === m
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {m === 'manual' ? 'Manual input' : 'From balance sheet'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[5fr_7fr]">
        {/* ── Inputs ── */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Inputs
            </h3>

            <div className="space-y-4">
              {/* Balance sheet asset picker */}
              {calc.mode === 'balance-sheet' && (
                <Field label="Assets to include">
                  {data.assets.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No assets on your balance sheet yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                      {data.assets.map((asset) => {
                        const rate = asset.currency === base ? 1 : (data.exchangeRates[asset.currency] ?? 1)
                        const converted = (asset.amount || 0) * rate
                        const checked = calc.selectedAssetIds.includes(asset.id)
                        return (
                          <label
                            key={asset.id}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAsset(asset.id)}
                              className="accent-gray-900 dark:accent-gray-100"
                            />
                            <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
                              {asset.label || '(unnamed)'}
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-gray-400 dark:text-gray-500">
                              {formatCurrency(converted, base)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                  {calc.selectedAssetIds.length > 0 && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      {symbol}{Math.round(bsPrincipal).toLocaleString()} pulled from balance sheet — edit initial investment below to override.
                    </p>
                  )}
                </Field>
              )}

              {/* Initial investment */}
              <Field
                label="Initial investment"
                hint="The lump sum you start with"
              >
                <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:border-gray-500">
                  <span className="pl-3 text-sm text-gray-400 dark:text-gray-500">{symbol}</span>
                  <input
                    type="number"
                    value={calc.principal === 0 ? '' : calc.principal}
                    onChange={(e) => set({ principal: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min={0}
                    className="w-full rounded-lg bg-transparent px-2 py-2 text-sm text-gray-800 focus:outline-none dark:text-gray-200"
                  />
                </div>
              </Field>

              {/* Monthly contribution */}
              <Field
                label="Monthly contribution"
                hint="Optional recurring top-up added each month"
              >
                <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:border-gray-500">
                  <span className="pl-3 text-sm text-gray-400 dark:text-gray-500">{symbol}</span>
                  <input
                    type="number"
                    value={calc.monthlyContribution === 0 ? '' : calc.monthlyContribution}
                    onChange={(e) => set({ monthlyContribution: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min={0}
                    className="w-full rounded-lg bg-transparent px-2 py-2 text-sm text-gray-800 focus:outline-none dark:text-gray-200"
                  />
                </div>
              </Field>

              {/* Annual interest rate */}
              <Field label="Annual interest rate">
                <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:border-gray-500">
                  <input
                    type="number"
                    value={calc.annualRate === 0 ? '' : calc.annualRate}
                    onChange={(e) => set({ annualRate: parseFloat(e.target.value) || 0 })}
                    placeholder="7"
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none dark:text-gray-200"
                  />
                  <span className="pr-3 text-sm text-gray-400 dark:text-gray-500">%</span>
                </div>
              </Field>

              {/* Compound frequency */}
              <Field
                label="Compounding frequency"
                hint="How often interest is calculated and added to the balance"
              >
                <select
                  value={calc.frequency}
                  onChange={(e) => set({ frequency: e.target.value as typeof calc.frequency })}
                  className={INPUT_CLS}
                >
                  {FREQUENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              {/* Time period */}
              <Field label="Time period">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={calc.years === 0 ? '' : calc.years}
                    onChange={(e) => set({ years: Math.max(1, parseInt(e.target.value) || 1) })}
                    placeholder="10"
                    min={1}
                    max={50}
                    className={INPUT_CLS}
                  />
                  <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">years</span>
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Final balance',
                value: finalYear ? formatCurrency(finalYear.balance, base) : '—',
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'Total contributed',
                value: formatCurrency(totalContributions, base),
                color: 'text-gray-700 dark:text-gray-200',
              },
              {
                label: 'Interest earned',
                value: finalYear ? formatCurrency(Math.max(0, totalInterest), base) : '—',
                color: 'text-blue-600 dark:text-blue-400',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {card.label}
                </p>
                <p className={`mt-1 text-base font-semibold tabular-nums ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {multiplier !== null && multiplier > 1 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your investment grows{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {multiplier.toFixed(1)}×
              </span>{' '}
              over {calc.years} year{calc.years !== 1 ? 's' : ''} at {calc.annualRate}% p.a.
            </p>
          )}

          {/* Chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <GrowthChart data={growthData} currency={base} />
          </div>
        </div>
      </div>

      {/* Year-by-year table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Year-by-year breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                {['Year', 'Balance', 'Total contributed', 'Interest earned', 'Interest %'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 first:text-left dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {growthData.slice(1).map((row) => {
                const interestPct = row.contributed > 0
                  ? ((row.balance - row.contributed) / row.contributed) * 100
                  : 0
                return (
                  <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-left tabular-nums text-gray-700 dark:text-gray-300">
                      {row.year}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.balance, base)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                      {formatCurrency(row.contributed, base)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-blue-600 dark:text-blue-400">
                      {formatCurrency(row.interest, base)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
                      +{interestPct.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

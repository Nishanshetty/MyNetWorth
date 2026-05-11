'use client'

import { Printer } from 'lucide-react'
import type { FinancialData, Metrics } from '@/lib/types'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'

interface Props {
  data: FinancialData
  metrics: Metrics
}

function PreviewRow({ label, amount, currency, bold }: { label: string; amount: number; currency: FinancialData['currency']; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'font-semibold' : ''}`}>
      <span className={bold ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}>
        {label}
      </span>
      <span className="tabular-nums text-gray-800 dark:text-gray-100">
        {formatCurrency(amount, currency)}
      </span>
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 border-b border-gray-300 pb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:border-gray-600 dark:text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function StatementPreviewTab({ data, metrics }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          How your statement will look when printed
        </p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          <Printer size={14} />
          Download as PDF
        </button>
      </div>

      {/* Print preview card — also used by print stylesheet */}
      <div
        id="print-statement"
        className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900 print:rounded-none print:border-none print:p-0 print:shadow-none"
      >
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Personal Financial Statement
          </h1>
          {data.userName && (
            <p className="mt-1 text-gray-600 dark:text-gray-400">{data.userName}</p>
          )}
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            As of {formatDate(new Date())}
          </p>
        </div>

        {/* Balance Sheet */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Balance sheet
          </h2>

          <PreviewSection title="Assets">
            {data.assets.map((item) => (
              <PreviewRow key={item.id} label={item.label || '—'} amount={item.amount} currency={data.currency} />
            ))}
            <PreviewRow label="Total assets" amount={metrics.totalAssets} currency={data.currency} bold />
          </PreviewSection>

          <PreviewSection title="Liabilities">
            {data.liabilities.map((item) => (
              <PreviewRow key={item.id} label={item.label || '—'} amount={item.amount} currency={data.currency} />
            ))}
            <PreviewRow label="Total liabilities" amount={metrics.totalLiabilities} currency={data.currency} bold />
          </PreviewSection>

          <div className="flex justify-between border-t-2 border-gray-900 pt-2 dark:border-gray-100">
            <span className="font-bold text-gray-900 dark:text-gray-100">Net worth</span>
            <span
              className={`font-bold tabular-nums ${
                metrics.netWorth >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {formatCurrency(metrics.netWorth, data.currency)}
            </span>
          </div>
        </div>

        {/* Income Statement */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Income statement (monthly)
          </h2>

          <PreviewSection title="Income">
            {data.income.map((item) => (
              <PreviewRow key={item.id} label={item.label || '—'} amount={item.amount} currency={data.currency} />
            ))}
            <PreviewRow label="Total income" amount={metrics.totalIncome} currency={data.currency} bold />
          </PreviewSection>

          <PreviewSection title="Expenses">
            {data.expenses.map((item) => (
              <PreviewRow key={item.id} label={item.label || '—'} amount={item.amount} currency={data.currency} />
            ))}
            <PreviewRow label="Total expenses" amount={metrics.totalExpenses} currency={data.currency} bold />
          </PreviewSection>

          <div className="flex justify-between border-t-2 border-gray-900 pt-2 dark:border-gray-100">
            <span className="font-bold text-gray-900 dark:text-gray-100">Net income</span>
            <span
              className={`font-bold tabular-nums ${
                metrics.netIncome >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {formatCurrency(metrics.netIncome, data.currency)}
            </span>
          </div>
          {metrics.savingsRate !== null && (
            <div className="mt-1 flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Savings rate</span>
              <span className="text-sm tabular-nums text-gray-600 dark:text-gray-400">
                {formatPercent(metrics.savingsRate)}
              </span>
            </div>
          )}
        </div>

        {/* Cash Flow */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cash flow statement
          </h2>

          <PreviewSection title="Inflows">
            {data.cashFlows.filter((r) => r.type === 'inflow').length === 0 ? (
              <p className="text-sm text-gray-400">No entries</p>
            ) : (
              data.cashFlows
                .filter((r) => r.type === 'inflow')
                .map((item) => (
                  <PreviewRow key={item.id} label={item.label || '—'} amount={item.amount} currency={data.currency} />
                ))
            )}
          </PreviewSection>

          <PreviewSection title="Outflows">
            {data.cashFlows.filter((r) => r.type === 'outflow').length === 0 ? (
              <p className="text-sm text-gray-400">No entries</p>
            ) : (
              data.cashFlows
                .filter((r) => r.type === 'outflow')
                .map((item) => (
                  <PreviewRow key={item.id} label={item.label || '—'} amount={item.amount} currency={data.currency} />
                ))
            )}
          </PreviewSection>

          <div className="flex justify-between border-t-2 border-gray-900 pt-2 dark:border-gray-100">
            <span className="font-bold text-gray-900 dark:text-gray-100">Net cash flow</span>
            <span
              className={`font-bold tabular-nums ${
                metrics.netCashFlow >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {formatCurrency(metrics.netCashFlow, data.currency)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Generated by MyNetWorth — mynetworth.nishan-shetty.com
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Moon,
  Sun,
  RotateCcw,
  Download,
  Upload,
  DollarSign,
  BarChart2,
} from 'lucide-react'

import SummaryDashboard from '@/components/SummaryDashboard'
import BalanceSheetTab from '@/components/BalanceSheetTab'
import IncomeStatementTab from '@/components/IncomeStatementTab'
import CashFlowTab from '@/components/CashFlowTab'
import StatementPreviewTab from '@/components/StatementPreviewTab'

import type { FinancialData, Tab, Currency } from '@/lib/types'
import { calculateMetrics } from '@/lib/calculations'
import { loadData, saveData, clearData, exportJSON, importJSON } from '@/lib/storage'
import { DEFAULT_DATA } from '@/lib/defaults'

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'INR']

const TABS: { id: Tab; label: string }[] = [
  { id: 'balance-sheet', label: 'Balance sheet' },
  { id: 'income', label: 'Income statement' },
  { id: 'cash-flow', label: 'Cash flow' },
  { id: 'preview', label: 'Preview & print' },
]

export default function Home() {
  const [data, setData] = useState<FinancialData>(DEFAULT_DATA)
  const [activeTab, setActiveTab] = useState<Tab>('balance-sheet')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadData()
    setData(saved)
    if (saved.darkMode) {
      document.documentElement.classList.add('dark')
    }
    setMounted(true)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // Debounced save to localStorage
  const scheduleSave = useCallback((d: FinancialData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveData(d), 500)
  }, [])

  const update = useCallback((patch: Partial<FinancialData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  const toggleDark = useCallback(() => {
    setData((prev) => {
      const next = { ...prev, darkMode: !prev.darkMode }
      document.documentElement.classList.toggle('dark', next.darkMode)
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  function handleReset() {
    clearData()
    const fresh = { ...DEFAULT_DATA, darkMode: data.darkMode, currency: data.currency }
    setData(fresh)
    setShowResetDialog(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importJSON(file)
      setData(imported)
      saveData(imported)
      document.documentElement.classList.toggle('dark', imported.darkMode)
    } catch {
      alert('Could not import file — make sure it is a valid MyNetWorth JSON export.')
    }
    e.target.value = ''
  }

  const metrics = useMemo(() => calculateMetrics(data), [data])

  if (!mounted) {
    // Avoid hydration mismatch — show skeleton until localStorage is read
    return (
      <div className="min-h-screen bg-background" />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="no-print sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-gray-700 dark:text-gray-300" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">MyNetWorth</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
              <DollarSign size={12} className="text-gray-400" />
              <select
                value={data.currency}
                onChange={(e) => update({ currency: e.target.value as Currency })}
                className="bg-transparent text-xs text-gray-600 focus:outline-none dark:text-gray-400"
                aria-label="Currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Name input */}
            <input
              type="text"
              value={data.userName}
              onChange={(e) => update({ userName: e.target.value })}
              placeholder="Your name (optional)"
              className="hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 placeholder-gray-400 focus:border-gray-300 focus:outline-none sm:block dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:placeholder-gray-600"
            />

            {/* Import */}
            <input
              ref={importRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import JSON"
            />
            <button
              onClick={() => importRef.current?.click()}
              title="Import JSON backup"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Import data"
            >
              <Upload size={15} />
            </button>

            {/* Export */}
            <button
              onClick={() => exportJSON(data)}
              title="Export JSON backup"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Export data"
            >
              <Download size={15} />
            </button>

            {/* Reset */}
            <button
              onClick={() => setShowResetDialog(true)}
              title="Reset all data"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              aria-label="Reset data"
            >
              <RotateCcw size={15} />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={data.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {data.darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Summary dashboard */}
        <section className="no-print mb-6">
          <SummaryDashboard metrics={metrics} currency={data.currency} />
        </section>

        {/* Tab navigation */}
        <nav className="no-print mb-4 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div>
          {activeTab === 'balance-sheet' && (
            <BalanceSheetTab data={data} metrics={metrics} onChange={update} />
          )}
          {activeTab === 'income' && (
            <IncomeStatementTab data={data} metrics={metrics} onChange={update} />
          )}
          {activeTab === 'cash-flow' && (
            <CashFlowTab data={data} metrics={metrics} onChange={update} />
          )}
          {activeTab === 'preview' && (
            <StatementPreviewTab data={data} metrics={metrics} />
          )}
        </div>

        {/* Footer */}
        <footer className="no-print mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-600">
          <p>
            Built by{' '}
            <a
              href="https://nishan-shetty.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 dark:hover:text-gray-400"
            >
              Nishan Shetty
            </a>{' '}
            · Data stored locally in your browser · No signup required
          </p>
        </footer>
      </main>

      {/* Reset confirmation dialog */}
      {showResetDialog && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowResetDialog(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Reset all data?</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will clear all your entries and restore the example rows. This cannot be undone
              — consider exporting a backup first.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

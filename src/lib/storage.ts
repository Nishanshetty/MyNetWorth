import type { FinancialData } from './types'
import { DEFAULT_DATA } from './defaults'

const KEY = 'mynetworth_v1'

export function loadData(): FinancialData {
  if (typeof window === 'undefined') return DEFAULT_DATA
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULT_DATA)
    const parsed = JSON.parse(raw) as Partial<FinancialData>
    // Merge with defaults so newly added fields always exist
    return { ...structuredClone(DEFAULT_DATA), ...parsed }
  } catch {
    return structuredClone(DEFAULT_DATA)
  }
}

export function saveData(data: FinancialData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function exportJSON(data: FinancialData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mynetworth-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const MAX_IMPORT_BYTES = 512 * 1024 // 512 KB — more than enough for any real statement

export function importJSON(file: File): Promise<FinancialData> {
  if (file.size > MAX_IMPORT_BYTES) {
    return Promise.reject(new Error('File is too large to be a valid backup (max 512 KB)'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as Partial<FinancialData>
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Invalid shape')
        }
        resolve({ ...structuredClone(DEFAULT_DATA), ...parsed })
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

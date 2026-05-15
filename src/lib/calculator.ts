export type CompoundFrequency = 'daily' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually'

export const FREQUENCY_OPTIONS: { value: CompoundFrequency; label: string }[] = [
  { value: 'daily',          label: 'Daily'          },
  { value: 'monthly',        label: 'Monthly'        },
  { value: 'quarterly',      label: 'Quarterly'      },
  { value: 'semi-annually',  label: 'Semi-annually'  },
  { value: 'annually',       label: 'Annually'       },
]

export interface CalculatorState {
  mode: 'manual' | 'balance-sheet'
  principal: number
  monthlyContribution: number
  annualRate: number
  frequency: CompoundFrequency
  years: number
  selectedAssetIds: string[]
}

export interface YearData {
  year: number
  balance: number
  contributed: number
  interest: number
}

export const DEFAULT_CALC_STATE: CalculatorState = {
  mode: 'manual',
  principal: 10000,
  monthlyContribution: 500,
  annualRate: 7,
  frequency: 'monthly',
  years: 10,
  selectedAssetIds: [],
}

// Returns the equivalent monthly rate for a given compounding frequency
function effectiveMonthlyRate(annualRate: number, frequency: CompoundFrequency): number {
  const r = annualRate / 100
  switch (frequency) {
    case 'daily':          return (1 + r / 365) ** (365 / 12) - 1
    case 'monthly':        return r / 12
    case 'quarterly':      return (1 + r / 4) ** (1 / 3) - 1
    case 'semi-annually':  return (1 + r / 2) ** (1 / 6) - 1
    case 'annually':       return (1 + r) ** (1 / 12) - 1
  }
}

export function calculateGrowth(state: CalculatorState): YearData[] {
  const { principal, monthlyContribution, annualRate, frequency, years } = state
  if (years <= 0) return []

  const monthlyRate = effectiveMonthlyRate(Math.max(0, annualRate), frequency)
  const results: YearData[] = [
    { year: 0, balance: principal, contributed: principal, interest: 0 },
  ]

  let balance = principal
  let contributed = principal

  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
    contributed += monthlyContribution
    if (m % 12 === 0) {
      results.push({
        year: m / 12,
        balance,
        contributed,
        interest: balance - contributed,
      })
    }
  }

  return results
}

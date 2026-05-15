import type { FinancialData } from './types'
import { DEFAULT_EXCHANGE_RATES } from './utils'
import { DEFAULT_CALC_STATE } from './calculator'

function id() {
  return Math.random().toString(36).slice(2, 10)
}

export const DEFAULT_DATA: FinancialData = {
  version: 1,
  userName: '',
  currency: 'USD',
  darkMode: false,
  exchangeRates: { ...DEFAULT_EXCHANGE_RATES },
  assets: [
    { id: id(), label: 'Checking account',              amount: 0, currency: 'USD' },
    { id: id(), label: 'Savings account',               amount: 0, currency: 'USD' },
    { id: id(), label: 'Investment portfolio',          amount: 0, currency: 'USD' },
    { id: id(), label: 'Retirement account (401k / IRA)', amount: 0, currency: 'USD' },
    { id: id(), label: 'Primary residence',             amount: 0, currency: 'USD' },
    { id: id(), label: 'Vehicle',                       amount: 0, currency: 'USD' },
  ],
  liabilities: [
    { id: id(), label: 'Mortgage',              amount: 0, currency: 'USD' },
    { id: id(), label: 'Car loan',              amount: 0, currency: 'USD' },
    { id: id(), label: 'Student loans',         amount: 0, currency: 'USD' },
    { id: id(), label: 'Credit card balance',   amount: 0, currency: 'USD' },
  ],
  income: [
    { id: id(), label: 'Salary (take-home)',       amount: 0, currency: 'USD' },
    { id: id(), label: 'Freelance / side income',  amount: 0, currency: 'USD' },
    { id: id(), label: 'Investment income',         amount: 0, currency: 'USD' },
  ],
  expenses: [
    { id: id(), label: 'Rent / mortgage payment', amount: 0, currency: 'USD' },
    { id: id(), label: 'Groceries',               amount: 0, currency: 'USD' },
    { id: id(), label: 'Utilities',               amount: 0, currency: 'USD' },
    { id: id(), label: 'Transportation',          amount: 0, currency: 'USD' },
    { id: id(), label: 'Subscriptions',           amount: 0, currency: 'USD' },
    { id: id(), label: 'Dining out',              amount: 0, currency: 'USD' },
  ],
  cashFlows: [
    { id: id(), type: 'inflow',  label: 'Tax refund',               amount: 0, currency: 'USD' },
    { id: id(), type: 'outflow', label: 'Annual insurance premium',  amount: 0, currency: 'USD' },
  ],
  calculator: { ...DEFAULT_CALC_STATE },
}

"use client"
import { create } from "zustand";
import { Currency, Transaction, TransactionListResponse, TransactionType } from "./types";
import { api } from "@/shared/lib/api";
import { useEffect } from "react";
import { useUserStore } from "../user/store";

type State = {
  currenciesMap: Record<Currency["name"], Currency["symbol"]>;
  transactions: Transaction[];
  lastPage: number;
  total: number;
  loading: boolean;
  exchangeRate: number;
  exchange: (data: { from: string, to: string, amount: number }) => Promise<void>;
  transfer: (data: { toAccountId: string, currency: string, amount: number }) => Promise<void>;
  getExchangeRate: (from: string, to: string) => Promise<number>;
  loadTransactions: (params?: { page?: number, limit?: number, type?: TransactionType }) => Promise<void>
}

const exchangeRates = new Map<string, { value: number, timestamp: number }>()

export const useTransactionsStore = create<State>((set, get) => ({
  transactions: [],
  currenciesMap: {},
  lastPage: 0,
  total: 0,
  loading: false,
  exchangeRate: 0,
  exchange: async (data) => {
    const updateBalance = useUserStore.getState().updateBalance

    set({ loading: true })
    try {
      const { data: transaction } = await api.post<Transaction>("/transactions/exchange", data)
      set({ transactions: [transaction, ...get().transactions], total: get().total + 1 })
      console.log("Updating balances")
      updateBalance(-data.amount, data.from)
      updateBalance(+data.amount, data.to)

    } finally {
      set({ loading: false })
    }
  },
  transfer: async (data) => {
    const updateBalance = useUserStore.getState().updateBalance

    set({ loading: true })
    try {
      const { data: transaction } = await api.post<Transaction>("/transactions/transfer", data)
      set({ transactions: [transaction, ...get().transactions], total: get().total + 1 })
      updateBalance(-data.amount, data.currency)
    } finally {
      set({ loading: false })
    }
  },
  getExchangeRate: async (from, to) => {
    const key = `${from}:${to}`
    const cached = exchangeRates.get(key)
    if (cached) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      if (cached.timestamp > oneHourAgo) return cached.value

      exchangeRates.delete(key)
    }

    set({ loading: true })
    try {
      const { data } = await api.get<number>(`/accounts/exchange-rate/${key}`)
      exchangeRates.set(key, { value: data, timestamp: Date.now() })
      set({ exchangeRate: data })

      return data
    } finally {
      set({ loading: false })
    }
  },
  loadTransactions: async (params = {}) => {
    set({ loading: true })
    try {
      const { data } = await api.get<TransactionListResponse>('/transactions', { params })
      set({ transactions: data.list, total: data.total, lastPage: data.lastPage })
    } finally {
      set({ loading: false })
    }
  }
}))

export function InitializeTransactionsStore({ currencies }: { currencies: Currency[] }) {
  useEffect(() => {
    const currenciesMap = Object.fromEntries(currencies.map(curr => ([curr.symbol, curr.name])))
    useTransactionsStore.setState({ currenciesMap })
  }, [currencies])

  return null
}

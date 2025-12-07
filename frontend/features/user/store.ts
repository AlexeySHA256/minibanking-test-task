"use client"
import { create } from "zustand";
import { User } from "./types";
import { api } from "@/shared/lib/api";
import { useEffect } from "react";

type State = {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  register: (data: { name: string, email: string, password: string }) => Promise<void>;
  login: (data: { email: string, password: string }) => Promise<void>;
  updateBalance: (addend: number, currency: string) => void
}

export const useUserStore = create<State>((set, get) => ({
  user: null,
  initialized: false,
  loading: false,
  register: async (data) => {
    set({ loading: true })
    try {
      const response = await api.post<User>("/auth/register", data)
      set({ user: response.data })
    } finally {
      set({ loading: false })
    }
  },
  login: async (data) => {
    set({ loading: true })
    try {
      const response = await api.post<User>("/auth/login", data)
      set({ user: response.data })
    } finally {
      set({ loading: false })
    }
  },
  updateBalance: (addend, currency) => {
    const oldUser = get().user
    if (!oldUser) return

    const newAccounts = oldUser.accounts.slice()
    const targetIndex = newAccounts.findIndex(acc => acc.currency === currency)
    if (targetIndex === -1) return
    const oldAccount = newAccounts[targetIndex]
    newAccounts[targetIndex] = { ...oldAccount, balance: parseFloat((oldAccount.balance + addend).toFixed(2)) }

    set({ user: { ...oldUser, accounts: newAccounts } })
  }
}))


export function InitializeUserStore({ user }: { user: User | null }) {
  useEffect(() => {
    useUserStore.setState({ user, initialized: true })
  }, [user])

  return null
}

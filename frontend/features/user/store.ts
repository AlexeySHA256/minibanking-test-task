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
}

export const useUserStore = create<State>((set) => ({
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
}))


export function InitializeUserStore({ user }: { user: User | null }) {
  useEffect(() => {
    useUserStore.setState({ user, initialized: true })
  }, [user])

  return null
}

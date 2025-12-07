"use client"

import { useTransactionsStore } from "@/features/transactions/store"
import { useUserStore } from "@/features/user/store"
import { User } from "@/features/user/types"

export function BalancesSection({ user }: { user: User }) {
  const storeUser = useUserStore(state => state.user)
  const currenciesMap = useTransactionsStore(state => state.currenciesMap)

  if (storeUser) user = storeUser

  return (
    <section>
      <h3 className="text-2xl font-semibold mb-2">Balances overview</h3>
      {user.accounts.map(account => (
        <div key={account.id} className="flex gap-6 font-bold justify-center text-lg">
          <p>{account.id} ({currenciesMap[account.currency]}):</p>
          <p>{account.currency}{account.balance}</p>
        </div>
      ))}
    </section>
  )
}

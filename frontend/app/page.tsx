import { TransactionCard } from "@/features/transactions/card";
import { TransactionListResponse } from "@/features/transactions/types";
import { getMe } from "@/features/user/api";
import { api } from "@/shared/lib/api";
import { CURRENCY_SYMBOLS } from "@/shared/lib/constants";
import { redirect } from "next/navigation";
import React from "react";


export default async function Page() {
  const user = await getMe()
  if (!user) return redirect("/auth/login")

  const { data: transactionsData } = await api.get<TransactionListResponse>("/transactions", { params: { limit: 5 } })

  return (
    <div className="flex flex-col gap-4 items-center mt-14 text-center">
      <h1 className="text-5xl font-extrabold">Welcome to the app</h1>
      <section>
        <h3 className="text-2xl font-semibold mb-2">Balances overview</h3>
        {user.accounts.map(account => (
          <div key={account.id} className="flex gap-6 font-bold justify-center text-lg">
            <p>{account.currency}:</p>
            <p>{account.balance} {CURRENCY_SYMBOLS[account.currency]}</p>
          </div>
        ))}
      </section>
      <section>
        <h3 className="text-2xl font-semibold mb-2">Latest transactions</h3>
        <div className="flex flex-col gap-4">
          {transactionsData.list.map((transaction, index) =>
            <React.Fragment key={transaction.id}>
              <TransactionCard transaction={transaction} />
              {index !== transactionsData.list.length - 1 &&
                <div className="h-px border"></div>
              }
            </React.Fragment>
          )}
        </div>
      </section>
    </div>
  );
}

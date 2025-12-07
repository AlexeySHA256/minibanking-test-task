"use client"
import { TransactionCard } from "@/features/transactions/card";
import { useTransactionsStore } from "@/features/transactions/store";
import { Spinner } from "@/shared/ui/spinner";
import React, { useEffect } from "react";

export function LatestTransactionsSection() {
  const loading = useTransactionsStore(state => state.loading)
  const loadTransactions = useTransactionsStore(state => state.loadTransactions)
  const transactions = useTransactionsStore(state => state.transactions)

  useEffect(() => {
    loadTransactions()
  }, [])

  if (loading) return <Spinner className="size-8" />

  return (
    <section>
      <h3 className="text-2xl font-semibold mb-2">Latest transactions</h3>
      <div className="flex flex-col gap-4">
        {transactions.slice(0, 5).map((transaction, index) =>
          <React.Fragment key={transaction.id}>
            <TransactionCard transaction={transaction} />
            {index !== transactions.length - 1 &&
              <div className="h-px"></div>
            }
          </React.Fragment>
        )}
      </div>
    </section>
  )
}

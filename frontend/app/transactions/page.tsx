"use client"

import { TransactionCard } from "@/features/transactions/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useTransactionsStore } from "@/features/transactions/store"
import { TransactionType } from "@/features/transactions/types"
import React, { useEffect, useState } from "react"
import { Spinner } from "@/shared/ui/spinner";
import { Button } from "@/shared/ui/button";

export default function Page() {
  const transactions = useTransactionsStore(state => state.transactions)
  const loadTransactions = useTransactionsStore(state => state.loadTransactions)
  const loading = useTransactionsStore(state => state.loading)
  const lastPage = useTransactionsStore(state => state.lastPage)
  const [transactionType, setTransactionType] = useState<TransactionType>()
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadTransactions({ page, type: transactionType })
  }, [page, transactionType])

  const handleChangeTransactionType = (value: string) => {
    setTransactionType(value as TransactionType)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4 items-center text-center py-20">
      <h1 className="text-5xl font-extrabold">View the list of all transaction on your accounts</h1>
      {loading ?
        <Spinner className="size-8" /> :
        <>
          <div className="flex items-center gap-2">
            <Select
              value={transactionType}
              onValueChange={handleChangeTransactionType}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by transaction type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TransactionType).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setTransactionType(undefined)} variant="secondary">Reset</Button>
          </div>
          {transactions.map((transaction, index) =>
            <React.Fragment key={transaction.id}>
              <TransactionCard transaction={transaction} />
              {index !== transactions.length - 1 &&
                <div className="h-px"></div>
              }
            </React.Fragment>
          )}
          {transactions.length && <div className="flex items-center justify-center gap-8">
            {page > 1 &&
              <div className="flex gap-2">
                <Button onClick={() => setPage(1)}>First</Button>
                <Button onClick={() => setPage(page => page - 1)}>Previous</Button>
              </div>
            }
            <p className="text-primary font-semibold text-lg">{page}</p>
            {page < lastPage &&
              <div className="flex gap-2">
                <Button onClick={() => setPage(page => page + 1)}>Next</Button>
                <Button onClick={() => setPage(lastPage)}>Last</Button>
              </div>
            }
          </div>}
        </>
      }
    </div>
  )
}

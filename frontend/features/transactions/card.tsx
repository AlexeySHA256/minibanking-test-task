import { ArrowRightLeftIcon, SendIcon } from "lucide-react";
import { Transaction, TransactionType } from "./types";
import { formatDistanceToNow } from "date-fns";
import { CURRENCY_SYMBOLS } from "@/shared/lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex gap-4 items-center h-14">
      <div className="flex gap-2">
        <div className="p-4 rounded-md aspect-square bg-gray-200 flex justify-center items-center">
          <Tooltip>
            {transaction.type === TransactionType.EXCHANGE ? (
              <>
                <TooltipTrigger><ArrowRightLeftIcon /></TooltipTrigger>
                <TooltipContent>Exchange</TooltipContent>
              </>
            ) : (
              <>
                <TooltipTrigger><SendIcon /></TooltipTrigger>
                <TooltipContent>Transfer</TooltipContent>
              </>
            )}
          </Tooltip>
        </div>
        <div className="text-left flex flex-col justify-center">
          <p>{transaction.id}</p>
          <p className="text-gray-500">{formatDistanceToNow(new Date(new Date(transaction.createdAt)), { addSuffix: true })}</p>
        </div>
      </div>
      <div className="text-left flex flex-col justify-center">
        <p>From: <span className="text-primary font-semibold">{transaction.fromAccountId}</span></p>
        <p>To: <span className="text-primary font-semibold">{transaction.toAccountId}</span></p>
      </div>
      <div className="p-2 rounded-md border font-bold">{transaction.value} {CURRENCY_SYMBOLS[transaction.currency]}</div>
    </div>
  )
}

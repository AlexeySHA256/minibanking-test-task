import { getMe } from "@/features/user/api";
import { redirect } from "next/navigation";
import { BalancesSection } from "./balances";
import { ExchangeForm } from "@/features/transactions/exchange-form";
import { TransferForm } from "@/features/transactions/transfer-form";
import { LatestTransactionsSection } from "./latest-transactions";


export default async function Page() {
  const user = await getMe()
  if (!user) return redirect("/auth/login")

  return (
    <div className="flex flex-col gap-4 items-center mt-14 text-center py-20">
      <h1 className="text-5xl font-extrabold">Welcome to the app</h1>
      <BalancesSection user={user} />
      <LatestTransactionsSection />
      <section>
        <h3 className="text-2xl font-semibold mb-2">Make a transaction</h3>
        <div className="flex justify-between gap-5">
          <ExchangeForm />
          <div className="h-full w-px"></div>
          <TransferForm />
        </div>
      </section>
    </div>
  );
}

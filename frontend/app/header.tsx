"use client"
import { useUserStore } from "@/features/user/store";
import { User } from "@/features/user/types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export function Header({ user }: { user: User | null }) {
  const userInitialized = useUserStore(state => state.initialized)
  const storeUser = useUserStore(state => state.user)

  if (userInitialized) user = storeUser

  return (
    <div className={cn("w-full p-5 border-b flex gap-5 items-center", !user && "justify-end")}>
      {user ?
        <>
          <Link className="transition-colors hover:text-primary" href="/">Dashboard</Link>
          <Link className="transition-colors hover:text-primary" href="/transactions">Transactions</Link>
        </> :
        <>
          <Button asChild><Link href="/auth/login">Login</Link></Button>
          <Button asChild variant="outline"><Link href="/auth/register">Register</Link></Button>
        </>
      }
    </div>
  )
}

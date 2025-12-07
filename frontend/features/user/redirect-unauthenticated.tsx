"use client"
import { useUserStore } from "./store";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { User } from "./types";
import { useEffect } from "react";

export function RedirectUnauthenticated({ user }: { user: User | null }) {
  const initialized = useUserStore((state) => state.initialized);
  const storeUser = useUserStore((state) => state.user);
  const path = usePathname();
  const router = useRouter();

  if (initialized) user = storeUser

  useEffect(() => {
    if (!user && !path.startsWith("/auth")) {
      router.replace("/auth/login")
    }

    if (user && path.startsWith("/auth")) {
      router.replace("/")
    }
  }, [user, path, router])

  return null;
}

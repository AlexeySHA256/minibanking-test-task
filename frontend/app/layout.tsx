import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./header";
import { Toaster } from "sonner";
import { RedirectUnauthenticated } from "@/features/user/redirect-unauthenticated";
import { getMe } from "@/features/user/api";
import { InitializeUserStore } from "@/features/user/store";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: "Minibank",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getMe()

  return (
    <html lang="en" className={inter.className}>
      <body
        className="antialiased w-full min-h-screen flex flex-col"
      >
        <Header user={user} />
        <RedirectUnauthenticated user={user} />
        <InitializeUserStore user={user} />

        <main className="flex-1">
          {children}
        </main>
        <Toaster richColors />
      </body>
    </html>
  );
}

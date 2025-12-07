
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getCookies() {
  if (typeof window !== 'undefined') return '';
  const { headers } = await import('next/headers');
  const headersData = await headers();
  return headersData.get('cookie') || '';
}


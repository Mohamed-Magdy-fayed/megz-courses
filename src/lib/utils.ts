import { Address } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAddress = (address: Address) => `${address?.city || "no city"
  }, ${address?.state || "no state"}, 
${address?.country || "no country"}`;

export const salesOperationCodeGenerator = () => {
  return `SO-${Date.now()}`
}

export const orderCodeGenerator = () => {
  return `CO-${Date.now()}`
}

export const formatPrice = (price: number) => {
  return `EGP${(price / 100).toFixed(2)}`
}

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 }).format(value / 100)
}

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
  return `$${(price / 100).toFixed(2)}`
}

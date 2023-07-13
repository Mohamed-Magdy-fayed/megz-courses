import { Address } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAddress = (address: Address) => `${
  address?.city || "no city"
}, ${address?.state || "no state"}, 
${address?.country || "no country"}`;

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

export const getLastWeekDate = (now = new Date()) => {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7,
  );
}

export const isGoodState = (difference: number, isLiability: boolean) => {
  return (isLiability && difference < 0) || (!isLiability && difference > 0)
}

export const getDifferenceMargin = <T extends { createdAt: Date }>(data: T[], accessor: keyof typeof data[0]) => {
  const currentTotal = data
    .map(item => item[accessor])
    .reduce((prev, curr) => {
      return prev + Number(curr)
    }, 0)

  const lastWeekTotal = data
    .filter(item => new Date(item.createdAt) > getLastWeekDate())
    .map(item => item[accessor])
    .reduce((prev, curr) => {
      return prev + Number(curr)
    }, 0)

  const secondLastWeekTotal = data
    .filter(item => new Date(item.createdAt) > getLastWeekDate(getLastWeekDate()) && new Date(item.createdAt) < getLastWeekDate())
    .map(item => item[accessor])
    .reduce((prev, curr) => {
      return prev + Number(curr)
    }, 0)

  return {
    differenceMargin: lastWeekTotal / secondLastWeekTotal * 100,
    total: currentTotal
  }
}

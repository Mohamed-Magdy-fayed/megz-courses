import { FilterColumn, FilterOption, StringValueOf } from "@/components/ui/ServerDataTable/utils/types";
import { FilterFn } from "@tanstack/react-table";

export type NestedKey<T> = T extends Date | Array<any>
    ? never
    : T extends object
    ? {
        [K in keyof T]: K extends string
        ? `${K}` | (T[K] extends object ? `${K}.${NestedKey<T[K]>}` : never)
        : never;
    }[keyof T]
    : never;

export function getProperty<TData, K extends Extract<keyof TData, string>>(obj: TData, key: K): TData[K] {
    return obj[key];
}

export const filterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const val = row.original[columnId];

    // Handle null or undefined values
    if (val === null || val === undefined) return true;

    // Handle Date fields
    if (val instanceof Date) {
        const [startDateStr, endDateStr] = filterValue.split('|');
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime();
    }

    // Handle string fields
    if (typeof val === 'string') {
        return val.toLowerCase().includes(filterValue.toLowerCase());
    }

    // Handle object fields
    if (typeof val === 'object') {
        const stringifiedVal = JSON.stringify(val).toLowerCase();
        return stringifiedVal.includes(filterValue.toLowerCase());
    }

    // Default: include the row
    return true;
};

export const dateFilterFn = <TData>(key: Extract<{ [K in Extract<keyof TData, string>]: TData[K] extends Date ? K : never }[Extract<keyof TData, string>], string>, filterValue: any) => {
    const [startDateStr, endDateStr] = filterValue.split('|');
    if (!startDateStr || !endDateStr) throw new Error("Not a correct date format!")
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return { key, from: startDate, to: endDate };
};

export const searchFilterFn = <TData>(key: Extract<keyof TData, string>, filterValue: any) => {
    return { key, value: filterValue };
};

export const selectFilterFn = <TData>(key: Extract<keyof TData, string>, filterValue: any) => {
    return { key, value: filterValue };
};

export const addFiltersCounts = <TData>(
    filterName: string,
    key: Extract<keyof TData, string>, // Key to access TData
    options: FilterOption<TData>[], // Predefined selection options
    counts: Record<StringValueOf<TData>, number> // Count object from TRPC query
): FilterColumn<TData> => {
    return {
        filterName,
        key,
        values: options.map((option) => ({
            label: option.label,
            value: option.value,
            count: counts[option.value] || 0, // Retrieve count or default to 0
        })),
    };
};

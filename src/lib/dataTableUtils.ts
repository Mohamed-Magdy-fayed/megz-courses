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

export function getProperty<TData, K extends keyof TData>(obj: TData, key: K): TData[K] {
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

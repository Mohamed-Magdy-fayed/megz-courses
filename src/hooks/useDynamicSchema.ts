import { useMemo } from "react";
import { dateFilterFn, searchFilterFn } from "@/lib/dataTableUtils";
import { ColumnFiltersState } from "@tanstack/react-table";
import { DateRangeColumn, FilterColumn, SearchColumn } from "@/components/ui/ServerDataTable/utils/types";

const useDynamicSchema = <TData>(
    columnFilters: ColumnFiltersState,
    dateRanges: DateRangeColumn<TData>[],
    searches: SearchColumn<TData>[],
    filters: FilterColumn<TData>[]
) => {
    return useMemo(() => ({
        dateRanges: dateRanges.flatMap(({ key }) =>
            columnFilters
                .filter((f) => f.id === key)
                .map((f) => dateFilterFn<TData>(key, f.value))
        ),
        searches: searches.flatMap(({ key }) =>
            columnFilters
                .filter((f) => f.id === key)
                .map((f) => searchFilterFn<TData>(key, f.value))
        ),
        filters: filters.flatMap(({ key }) =>
            columnFilters
                .filter((f) => f.id === key)
                .map((f) => searchFilterFn<TData>(key, f.value))
        ),
    }), [columnFilters, dateRanges, searches, filters]);
};

export default useDynamicSchema;

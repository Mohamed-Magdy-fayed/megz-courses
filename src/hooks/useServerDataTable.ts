import { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table"
import { useState } from "react"

export default function useServerDataTable() {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

    return {
        columnFilters, setColumnFilters,
        pagination, setPagination,
        sorting, setSorting,
    }
}

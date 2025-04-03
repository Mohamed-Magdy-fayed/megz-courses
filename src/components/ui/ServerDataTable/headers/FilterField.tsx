import { FilterColumn, StringKeyOf } from "@/components/ui/ServerDataTable/utils/types";
import TableSelectField from "@/components/ui/TableSelectField"
import { Typography } from "@/components/ui/Typoghraphy"
import { Header, Table } from "@tanstack/react-table"

export default function FilterField<TData>({ currentFilter, table, header }: {
    table: Table<TData>;
    header: Header<TData, unknown>;
    currentFilter: FilterColumn<TData>;
}) {
    return (
        <TableSelectField
            data={currentFilter.values.map(val => ({
                Active: true,
                label: val.label,
                value: val.value,
                customLabel: (
                    <div className="flex items-center justify-between gap-4 w-full">
                        <Typography>{val.label}</Typography>
                        <Typography>{val.count ||
                            (
                                table.getFilteredRowModel().rows.length > 0
                                    ? table.getFilteredRowModel().rows.filter(row => row.original[currentFilter.key as StringKeyOf<TData>] === val.value).length
                                    : table.getCoreRowModel().rows.filter(row => row.original[currentFilter.key as StringKeyOf<TData>] === val.value).length
                            )
                        }</Typography>
                    </div>
                )
            })) || []}
            listTitle={header.isPlaceholder
                ? null
                : (
                    <div className="flex items-center justify-between">
                        <Typography>{currentFilter.filterName}</Typography>
                        <Typography className="text-info">
                            {table.getCoreRowModel().rows.length}
                        </Typography>
                    </div>
                )}
            placeholder={currentFilter.filterName || ""}
            handleChange={(val) => {
                const isSameFilter = table.getColumn(header.id)?.getFilterValue() === val
                table.getColumn(header.id)?.setFilterValue(isSameFilter ? undefined : val)
            }}
        />
    )
}

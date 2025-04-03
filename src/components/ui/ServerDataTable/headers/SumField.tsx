import { StringKeyOf } from '@/components/ui/ServerDataTable/utils/types';
import { Typography } from '@/components/ui/Typoghraphy'
import { cn, formatPrice } from '@/lib/utils'
import { Table } from '@tanstack/react-table';

export default function SumField<TData>({ currentSummedField, table }: {
    table: Table<TData>;
    currentSummedField: {
        key: StringKeyOf<TData>,
        label: string,
        isNegative?: boolean,
    }
}) {
    return (
        <div className="flex items-center gap-4 flex-shrink">
            <Typography className={cn(currentSummedField.isNegative ? "text-destructive" : "text-muted")}>
                {currentSummedField.label}
            </Typography>
            <Typography className={cn(currentSummedField.isNegative ? "text-destructive" : "text-muted")}>
                {currentSummedField.isNegative && "("}
                {
                    formatPrice(table.getFilteredSelectedRowModel().rows.length > 0
                        ? table.getFilteredSelectedRowModel().rows.map(r => r.original[currentSummedField.key]).reduce((a, b) => {
                            return Number(a) + Number(b)
                        }, 0)
                        : table.getFilteredRowModel().rows.map(r => r.original[currentSummedField.key]).reduce((a, b) => {
                            return Number(a) + Number(b)
                        }, 0))
                }
                {currentSummedField.isNegative && ")"}
            </Typography>
        </div>
    )
}

import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Header, Table } from '@tanstack/react-table';
import { useState } from 'react';

export default function DateRangeField<TData>({ currentDateFilter, header, table }: {
    table: Table<TData>;
    header: Header<TData, unknown>;
    currentDateFilter: {
        key: Extract<keyof TData, string>,
        label: string,
    }
}) {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date())
    const [endDate, setEndDate] = useState<Date | undefined>(new Date())

    return (
        <DateRangePicker
            label={currentDateFilter?.label || "No Label"}
            handleReset={() => {
                const col = table.getColumn(header.id)
                col?.setFilterValue(undefined)
            }}
            handleChange={() => {
                if (!startDate && !endDate) {
                    const col = table.getColumn(header.id)
                    col?.setFilterValue(undefined)
                    return
                }

                if (!startDate && endDate) {
                    const newStartDate = new Date(endDate.getTime())
                    newStartDate.setHours(0, 0, 0)
                    const newEndDate = new Date(endDate.getTime())
                    newEndDate.setHours(23, 59, 59)
                    const col = table.getColumn(header.id)
                    col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                    return
                }

                if (!endDate && startDate) {
                    const newStartDate = new Date(startDate.getTime())
                    newStartDate.setHours(0, 0, 0)
                    const newEndDate = new Date(startDate.getTime())
                    newEndDate.setHours(23, 59, 59)
                    const col = table.getColumn(header.id)
                    col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                    return
                }

                if (startDate === endDate) {
                    const newStartDate = new Date(startDate?.getTime()!);
                    newStartDate.setHours(0, 0, 0);
                    const newEndDate = new Date(endDate?.getTime()!)
                    newEndDate.setHours(23, 59, 59)

                    const col = table.getColumn(header.id)
                    col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                    return
                }

                const newStartDate = new Date(startDate?.getTime()!);
                newStartDate.setHours(0, 0, 0);
                const newEndDate = new Date(endDate?.getTime()!)
                newEndDate.setHours(23, 59, 59)

                const col = table.getColumn(header.id)
                col?.setFilterValue(`${newStartDate}|${newEndDate}`)
                return
            }}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
        />
    )
}

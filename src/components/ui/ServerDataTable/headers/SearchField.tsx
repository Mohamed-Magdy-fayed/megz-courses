import SortButton from '@/components/ui/ServerDataTable/headers/SortButton';
import { TableInput } from '@/components/ui/table-input'
import useDebounce from '@/hooks/useDebounce';
import { Header, Table } from '@tanstack/react-table';
import { useState } from 'react';

export default function SearchField<TData>({ currentSearch, table, header }: {
    currentSearch: {
        key: Extract<keyof TData, string>,
        label: string,
    };
    table: Table<TData>;
    header: Header<TData, unknown>;
}) {
    const [trigger, setTrigger] = useState("")
    const handleChange = (val: string) => { table.getColumn(header.id)?.setFilterValue(val); table.resetPagination(); }

    useDebounce(() => handleChange(trigger), 1000, [trigger])

    return (
            <TableInput
                placeholder={currentSearch.label}
                value={trigger}
                onChange={(event) =>
                    setTrigger(event.target.value)
                }
            />
    )
}

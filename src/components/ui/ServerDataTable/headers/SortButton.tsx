import { Button } from "@/components/ui/button";
import { Header, SortingState } from "@tanstack/react-table";
import { ChevronsUpDownIcon, SortDesc } from "lucide-react";
import { SortAsc } from "lucide-react";
import { Dispatch, SetStateAction, useMemo } from "react";

export default function SortButton<TData>({ header, setSorting }: { header: Header<TData, unknown>; setSorting: Dispatch<SetStateAction<SortingState>> }) {
    const handleSort = (columnId: string) => {
        setSorting((prev) => {
            const existingSort = prev.find((s) => s.id === columnId);

            if (!existingSort) {
                // If not in sorting, add with ascending order
                return [...prev, { id: columnId, desc: false }];
            } else if (!existingSort.desc) {
                // If ascending, change to descending
                return prev.map((s) => (s.id === columnId ? { ...s, desc: true } : s));
            } else {
                // If descending, remove from sorting
                return prev.filter((s) => s.id !== columnId);
            }
        });
    };

    const isSorted = useMemo(() => header.column.getIsSorted(), [header.column.getIsSorted()])

    return (
        <Button
            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
            onClick={() => handleSort(header.column.id)}
        >
            {!isSorted && <ChevronsUpDownIcon size={20} className="text-primary" />}
            {isSorted === "asc" && <SortAsc className="h-4 w-4 text-primary" />}
            {isSorted === "desc" && <SortDesc className="h-4 w-4 text-primary" />}
        </Button>
    )
}

import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface GenericClientProps<T> {
    columns: ColumnDef<T>[];
    formattedData?: T[];
}

const GenericClient = <T,>({ columns, formattedData }: GenericClientProps<T>) => {
    return (
        <DataTable
            skele={!formattedData}
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
        />
    );
};

export default GenericClient;

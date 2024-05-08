import { DataTable } from "@/components/ui/DataTable";
import { MaterialsColumn, columns } from "./MaterialsColumn";
import { MaterialItem } from "@prisma/client";

const MaterialsClient = ({ data }: { data: MaterialItem[] }) => {
    const formattedData: MaterialsColumn[] = data.map(({
        id,
        createdAt,
        updatedAt,
        frameWorkName,
        title,
        subTitle,
        courseId,
    }) => ({
        id,
        createdAt,
        updatedAt,
        frameWorkName,
        title,
        subTitle,
        courseId,
    }))

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setUsers={() => { }}
            onDelete={() => { }}
            search={{ key: "title", label: "Title" }}
        />
    );
};

export default MaterialsClient;

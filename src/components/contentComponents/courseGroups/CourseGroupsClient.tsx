import { DataTable } from "@/components/ui/DataTable";
import { CourseRow, columns } from "./CourseGroupsColumn";

const CourseGroupsClient = ({ formattedData }: { formattedData: CourseRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            searches={[
                { key: "groupNumber", label: "Group name" }
            ]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] }
            ]}
        />
    );
};

export default CourseGroupsClient;

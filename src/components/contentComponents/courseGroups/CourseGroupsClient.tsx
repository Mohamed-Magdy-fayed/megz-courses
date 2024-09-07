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
                { key: "groupNumber", label: "Group name" },
                { key: "startDate", label: "Start Date" },
            ]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
                {
                    key: "groupStatus", filterName: "Status", values: formattedData.map(d => ({
                        value: d.groupStatus,
                        label: d.groupStatus,
                    })) || []
                },
            ]}
        />
    );
};

export default CourseGroupsClient;

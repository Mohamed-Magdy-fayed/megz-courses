import { DataTable } from "@/components/ui/DataTable";
import { CourseRow, columns } from "./CourseGroupsColumn";

const CourseGroupsClient = ({ formattedData }: { formattedData: CourseRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            dateRanges={[{ key: "startDate", label: "Start Date" }]}
            searches={[
                { key: "groupNumber", label: "Group name" },
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
            exportConfig={{
                fileName: `Course Groups`,
                sheetName: "Course Groups",
            }}
        />
    );
};

export default CourseGroupsClient;

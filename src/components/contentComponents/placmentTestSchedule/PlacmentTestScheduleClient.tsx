import { DataTable } from "@/components/ui/DataTable";
import { type PlacmentTestScheduleRow, columns } from "./PlacmentTestScheduleColumn";

const PlacmentTestScheduleClient = ({ formattedData }: { formattedData: PlacmentTestScheduleRow[], isLoading?: boolean }) => {

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            searches={[
                { key: "studentName", label: "Student Name" },
                { key: "testerName", label: "Tester Name" },
            ]}
            dateRanges={[{ key: "oralTestTime", label: "Test Time" }]}
            exportConfig={{
                fileName: `Placement Test Schedules`,
                sheetName: "Placement Test Schedules",
            }}
        />
    );
};

export default PlacmentTestScheduleClient;

import { DataTable } from "@/components/ui/DataTable";
import { type PlacmentTestScheduleRow, columns } from "./PlacmentTestScheduleColumn";

const PlacmentTestScheduleClient = ({ formattedData }: { formattedData: PlacmentTestScheduleRow[] }) => {

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            searches={[
                { key: "studentName", label: "Student Name" },
                { key: "trainerName", label: "Trainer Name" },
            ]}
            dateRange={{ key: "oralTestTime", label: "Test Time" }}
        />
    );
};

export default PlacmentTestScheduleClient;

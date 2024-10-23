import { DataTable } from "@/components/ui/DataTable";
import { type PlacementTestSubmissionsRow, columns } from "./PlacmentTestSubmissionsColumn";

const PlacmentTestSubmissionsClient = ({ formattedData }: { formattedData: PlacementTestSubmissionsRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            searches={[
                { key: "studentName", label: "Student Name" },
            ]}
            dateRanges={[{ key: "createdAt", label: "Submitted At" }]}
            exportConfig={{
                fileName: `Placement Test Submissions`,
                sheetName: "Placement Test Submissions",
            }}
        />
    );
};

export default PlacmentTestSubmissionsClient;

import { DataTable } from "@/components/ui/DataTable";
import { type PlacementTestSubmissionsRow, columns } from "./PlacmentTestSubmissionsColumn";

const PlacmentTestSubmissionsClient = ({ formattedData }: { formattedData: PlacementTestSubmissionsRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
        />
    );
};

export default PlacmentTestSubmissionsClient;

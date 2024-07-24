import { DataTable } from "@/components/ui/DataTable";
import { type PlacmentTestScheduleRow, columns } from "./PlacmentTestScheduleColumn";

const PlacmentTestScheduleClient = ({ formattedData }: { formattedData: PlacmentTestScheduleRow[] }) => {

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
        />
    );
};

export default PlacmentTestScheduleClient;

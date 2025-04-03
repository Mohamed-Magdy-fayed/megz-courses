import { DataTable } from "@/components/ui/DataTable";
import { WaitingListRow, columns } from "./WaitingListColumn";

const WaitingListClient = ({ formattedData }: { formattedData: WaitingListRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={() => { }}
            searches={[
                { key: "email", label: "Email" }
            ]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] }
            ]}
            dateRanges={[{ key: "orders", label: "Ordered On" }]}
            exportConfig={{
                fileName: `${formattedData[0]?.levelName} Waiting List`,
                sheetName: "Waiting List",
            }}
        />
    );
};

export default WaitingListClient;

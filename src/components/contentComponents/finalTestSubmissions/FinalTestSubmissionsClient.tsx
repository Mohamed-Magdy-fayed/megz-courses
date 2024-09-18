import { DataTable } from "@/components/ui/DataTable";
import { type FinalTestSubmissionRow, columns } from "./FinalTestSubmissionsColumn";

const FinalTestSubmissionsClient = ({ formattedData }: { formattedData: FinalTestSubmissionRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={() => { }}
            onDelete={() => { }}
            searches={[
                { key: "email", label: "Email" },
            ]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
            ]}
            dateRanges={[{ key: "createdAt", label: "Submitted At" }]}
        />
    );
};

export default FinalTestSubmissionsClient;

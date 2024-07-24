import { DataTable } from "@/components/ui/DataTable";
import { type Column, columns } from "./TesterPlacmentTestsColumn";

const TesterPlacmentTestClient = ({ formattedData }: { formattedData: Column[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={() => { }}
            filters={[{
                key: "isLevelSubmittedString", filterName: "Submission status", values: [
                    {
                        label: "Completed",
                        value: "Completed",
                    },
                    {
                        label: "Waiting",
                        value: "Waiting",
                    },
                ]
            }]}
        />
    );
};

export default TesterPlacmentTestClient;

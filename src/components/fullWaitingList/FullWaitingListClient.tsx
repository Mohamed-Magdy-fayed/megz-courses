import { DataTable } from "@/components/ui/DataTable";
import { FullWaitingListRow, columns } from "./FullWaitingListColumn";

const FullWaitingListClient = ({ formattedData }: { formattedData: FullWaitingListRow[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={() => { }}
            searches={[
                { key: "email", label: "Email" }
            ]}
            filters={[
                {
                    key: "levelSlug", filterName: "Level", values: formattedData
                        .flatMap(d => d.levelSlugs.flatMap(s => s.value))
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(val => ({ label: val, value: val }))
                },
                {
                    key: "courseName", filterName: "Course", values: formattedData
                        .map(d => d.courseName)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(val => ({ label: val, value: val }))
                },
            ]}
            dateRange={{ key: "orders", label: "Ordered On" }}
        />
    );
};

export default FullWaitingListClient;

import { DataTable } from "@/components/ui/DataTable";
import { type Column, columns } from "./TesterPlacmentTestsColumn";

const TesterPlacmentTestClient = ({ formattedData }: { formattedData: Column[] }) => {
    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={() => { }}
            searches={[
                { key: "studentName", label: "Student Name" },
                { key: "courseName", label: "Course Name" },
            ]}
            filters={[
                {
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
                },
                {
                    key: "isWrittenTestDone", filterName: "Submission status", values: [
                        {
                            label: "Completed",
                            value: "true",
                        },
                        {
                            label: "Not Completed",
                            value: "false",
                        },
                    ]
                },
                {
                    key: "createdBy", filterName: "Created By", values: formattedData
                        .map(d => d.createdBy ? d.createdBy : "Null")
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(val => ({
                            label: val,
                            value: val,
                        }))
                },
            ]}
            dateRange={{ key: "testTime", label: "Oral Test Time" }}
        />
    );
};

export default TesterPlacmentTestClient;

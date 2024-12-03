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
                    key: "isLevelSubmittedString", filterName: "Oral Test", values: [
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
                    key: "isWrittenTestDone", filterName: "Written Test", values: [
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
            dateRanges={[{ key: "testTime", label: "Oral Test Time" }]}
            exportConfig={{
                fileName: `${formattedData[0]?.testersData[0]?.name} Placement Tests`,
                sheetName: "Placement Tests",
            }}
        />
    );
};

export default TesterPlacmentTestClient;

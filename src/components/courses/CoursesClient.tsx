import { columns, CourseRow } from "./CourseColumn";
import { DataTable } from "../ui/DataTable";

const CoursesClient = ({ formattedData }: { formattedData: CourseRow[] }) => {
  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={() => { }}
      onDelete={() => { }}
    />
  );
};

export default CoursesClient;

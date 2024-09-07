import { columns, CourseRow } from "./CourseColumn";
import { DataTable } from "../ui/DataTable";

type CoursesClientProps = {
  formattedData?: CourseRow[];
};

const CoursesClient = ({ formattedData }: CoursesClientProps) => {
  return (
    <DataTable
      skele={!formattedData}
      columns={columns}
      data={formattedData || []}
      setData={() => { }}
      onDelete={() => { }}
    />
  )
};

export default CoursesClient;

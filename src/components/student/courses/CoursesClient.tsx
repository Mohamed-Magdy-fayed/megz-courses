import { columns, CourseRow } from "./CourseColumn";
import { DataTable } from "@/components/ui/DataTable";

type CoursesClientProps = {
  formattedData?: CourseRow[];
};

const CoursesClient = ({ formattedData }: CoursesClientProps) => {
  return (
    <DataTable
      isLoading={!formattedData}
      columns={columns}
      data={formattedData || []}
      setData={() => { }}
      onDelete={() => { }}
    />
  )
};

export default CoursesClient;

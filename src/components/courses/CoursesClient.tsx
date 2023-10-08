import { columns } from "./CourseColumn";
import { DataTable } from "../ui/DataTable";
import { api } from "@/lib/api";
import Spinner from "../Spinner";

const CoursesClient = ({ userId }: { userId: string }) => {
  const { data } = api.courses.getStudentCourses.useQuery({ userId })

  const formattedData = data?.courses.map(({
    id,
    name,
  }) => {
    const formTestStatus = data?.user.placementTests.filter(test => test.courseId === id)[0]?.testStatus.form
    const oralTestStatus = data?.user.placementTests.filter(test => test.courseId === id)[0]?.testStatus.oral

    return {
      id,
      name,
      formTestStatus,
      oralTestStatus,
      courseStatus: data.user.courseStatus.find(state => state.courseId === id)?.state || "waiting"
    }
  })

  if (!formattedData) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

  return (
    <DataTable
      columns={columns}
      data={formattedData || []}
      setUsers={() => { }}
      onDelete={() => { }}
      search={{ key: "name", label: "Course Name" }}
    />
  );
};

export default CoursesClient;

import { columns } from "./CourseColumn";
import { DataTable } from "../ui/DataTable";
import { api } from "@/lib/api";
import Spinner from "../Spinner";
import { useEffect } from "react";

const CoursesClient = ({ userId }: { userId: string }) => {
  const { data, refetch } = api.courses.getStudentCourses.useQuery({ userId }, { enabled: false })

  const formattedData = data?.courses.map(({
    id,
    name,
  }) => {
    const filteredTest = data?.user.placementTests.find((test) => test.courseId === id);
    const formTestStatus = filteredTest?.testStatus?.form ?? null;
    const oralTestStatus = filteredTest?.testStatus?.oral ?? null;

    return {
      id,
      name,
      formTestStatus,
      oralTestStatus,
      courseStatus: data.user.courseStatus.find(state => state.courseId === id)?.state || "waiting"
    }
  })

  useEffect(() => {
    refetch()
  }, [])

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

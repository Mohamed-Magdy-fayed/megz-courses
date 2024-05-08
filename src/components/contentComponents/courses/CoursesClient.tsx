import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { Course, columns } from "./CoursesColumn";

const CoursesClient = () => {
    const { data } = api.courses.getAll.useQuery()

    const formattedData: Course[] = data?.courses ? data.courses.map(({
        id,
        name,
        image,
        createdAt,
        updatedAt,
        description,
        groupPrice,
        privatePrice,
        instructorPrice,
        level,
        form,
        oralTest,
        orders,
    }) => ({
        id,
        name,
        image,
        createdAt,
        updatedAt,
        description,
        groupPrice,
        privatePrice,
        instructorPrice,
        level,
        form,
        oralTest,
        orders,
    })) : []

    if (!data?.courses) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

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

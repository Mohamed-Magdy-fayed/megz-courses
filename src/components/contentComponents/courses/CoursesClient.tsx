import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { Course, columns } from "./CoursesColumn";
import { useState } from "react";
import { ToasterToast, useToast } from "@/components/ui/use-toast";

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
        oralTest,
        orders,
    })) : []

    const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>()
    const [courses, setCourses] = useState<Course[]>([])
    const { toast } = useToast()
    const trpcUtils = api.useContext()
    const deleteMutation = api.courses.deleteCourses.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 30000,
            }))
        },
        onSuccess: ({ deletedCourses }) => trpcUtils.courses.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `${deletedCourses.count} courses deleted`,
            title: "Success",
            duration: 2000,
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
            duration: 2000,
        }),
    })
    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(courses.map(({ id }) => id), {
            onSuccess: () => callback?.(),
        })
    }

    if (!data?.courses) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={setCourses}
            onDelete={onDelete}
            search={{ key: "name", label: "Course Name" }}
        />
    );
};

export default CoursesClient;

import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { CourseRow, columns } from "./CoursesColumn";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const CoursesClient = ({ formattedData }: { formattedData: CourseRow[] }) => {
    const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>()
    const [courses, setCourses] = useState<CourseRow[]>([])

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

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={setCourses}
            onDelete={onDelete}
            searches={[
                { key: "name", label: "Name" },
            ]}
        />
    );
};

export default CoursesClient;

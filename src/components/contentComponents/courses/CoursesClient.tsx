import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { CourseRow, columns } from "./CoursesColumn";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const CoursesClient = () => {
    const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>()
    const [courses, setCourses] = useState<CourseRow[]>([])

    const { toast } = useToast()

    const trpcUtils = api.useContext()
    const { data: coursesData, isLoading } = api.courses.getAll.useQuery();
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

    const formattedData = coursesData?.courses.map(course => ({
        id: course.id,
        name: course.name,
        slug: course.slug,
        image: course.image,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        description: course.description,
        groupPrice: course.groupPrice,
        privatePrice: course.privatePrice,
        instructorPrice: course.instructorPrice,
        levels: course.levels,
        orders: course.orders,
        enrollments: course.orders.length,
    }))

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(courses.map(({ id }) => id), {
            onSuccess: () => callback?.(),
        })
    }

    return (
        <DataTable
            skele={isLoading}
            columns={columns}
            data={formattedData || []}
            setData={setCourses}
            onDelete={onDelete}
            dateRange={{ key: "createdAt", label: "Created On" }}
            searches={[
                { key: "name", label: "Name" },
                { key: "groupPrice", label: "Group Price" },
                { key: "privatePrice", label: "Private Price" },
                { key: "instructorPrice", label: "Instructor Price" },
            ]}
        />
    );
};

export default CoursesClient;

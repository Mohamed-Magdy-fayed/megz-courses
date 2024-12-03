import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { CourseRow, columns } from "./CoursesColumn";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";

const CoursesClient = () => {
    const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>()
    const [courses, setCourses] = useState<CourseRow[]>([])

    const { toast } = useToast()

    const trpcUtils = api.useUtils()
    const { data: coursesData, isLoading } = api.courses.getAll.useQuery();
    const importMutation = api.courses.importCourses.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ courses }) => {
                return `${courses.length} courses Created`
            },
            loadingMessage: "Importing...",
        })
    )
    const deleteMutation = api.courses.deleteCourses.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedCourses }) => {
                return `${deletedCourses.count} courses deleted`
            },
            loadingMessage: "Deleting...",
        })
    )

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
            dateRanges={[{ key: "createdAt", label: "Created On" }]}
            searches={[
                { key: "name", label: "Name" },
                { key: "groupPrice", label: "Group Price" },
                { key: "privatePrice", label: "Private Price" },
                { key: "instructorPrice", label: "Instructor Price" },
            ]}
            exportConfig={{
                fileName: `Courses`,
                sheetName: "Courses",
            }}
            importConfig={{
                reqiredFields: ["name", "slug", "image", "description", "privatePrice", "groupPrice", "instructorPrice"],
                sheetName: "Courses Import Template",
                templateName: "Courses Import Template",
            }}
            handleImport={(data) => {
                importMutation.mutate(
                    data.map(course => ({
                        description: course.description || "",
                        image: course.image || "",
                        name: course.name,
                        slug: course.slug,
                        privatePrice: 0,
                        instructorPrice: 0,
                        groupPrice: 0,
                    }))
                )
            }}
        />
    );
};

export default CoursesClient;

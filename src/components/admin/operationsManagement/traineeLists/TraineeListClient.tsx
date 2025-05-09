import { traineeColumns, TraineeList } from '@/components/admin/operationsManagement/traineeLists/TraineeListColumn'
import { DataTable } from '@/components/ui/DataTable'
import { api } from '@/lib/api'
import { CourseStatuses } from '@prisma/client'

export default function TraineeListClient({ status, courseId }: { status: CourseStatuses; courseId?: string }) {
    const { data, isLoading } = api.traineeList.queryFullList.useQuery({ status, courseId })

    const formattedData: TraineeList[] = data?.rows.map(({
        user: {
            id: userId,
            name,
            image,
            email,
            phone,
        },
        level,
        course: {
            id: courseId,
            name: courseName,
            slug,
            levels,
        },
        isPrivate,
        createdAt,
        updatedAt,
    }) => ({
        id: userId,
        name,
        image,
        email,
        phone,
        courseId,
        courseName,
        courseSlug: slug,
        isPrivate: isPrivate ? "Private" as "Private" : "Group" as "Group",
        orderDate: updatedAt,
        levelSlugs: levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
        levelIds: levels.map(lvl => ({ label: lvl.name, value: lvl.id })) || [],
        levelSlug: level?.slug || "",
        levelName: level?.name || "",
        createdAt,
        updatedAt,
    })) || []

    return (
        <DataTable
            isLoading={isLoading}
            columns={traineeColumns}
            data={formattedData}
            setData={() => { }}
            searches={[
                { key: "name", label: "Name" }
            ]}
            filters={[
                {
                    key: "courseSlug", filterName: "Course", values: formattedData
                        .map(d => d.courseSlug)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(value => ({
                            label: formattedData.find(d => d.courseSlug === value)?.courseName || "",
                            value,
                        }))
                },
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
                { key: "isPrivate", filterName: "Is Private", values: [{ label: "Group", value: "Group" }, { label: "Private", value: "Private" }] },
            ]}
            dateRanges={[{ key: "updatedAt", label: "Ordered On" }]}
            exportConfig={{
                fileName: `${formattedData[0]?.levelName} Waiting List`,
                sheetName: "Waiting List",
            }}
        />
    )
}

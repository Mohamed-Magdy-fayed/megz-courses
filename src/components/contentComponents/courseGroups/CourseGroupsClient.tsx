import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { CourseGroups, columns } from "./CourseGroupsColumn";
import { ZoomGroup } from "@prisma/client";

const CourseGroupsClient = ({ zoomGroups }: { zoomGroups: ZoomGroup[] }) => {
    const { data } = api.zoomGroups.getzoomGroups.useQuery({ ids: zoomGroups.map(group => group.id) })

    const formattedData: CourseGroups[] = data?.zoomGroups ? data.zoomGroups.map(({
        id,
        groupNumber,
        groupStatus,
        startDate,
        students,
        trainer,
        zoomSessions,
        course,
        createdAt,
        updatedAt,
    }) => ({
        id,
        groupNumber,
        groupStatus,
        startDate,
        students,
        trainer: trainer!,
        zoomSessions,
        course: course!,
        createdAt,
        updatedAt,
    })) : []

    if (!data?.zoomGroups) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setUsers={() => { }}
            onDelete={() => { }}
            search={{ key: "groupNumber", label: "Group name" }}
        />
    );
};

export default CourseGroupsClient;

import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { type ColumnType, columns } from "./Column";
import { validGroupStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";

const ZoomGroupsClient = ({ userId }: { userId?: string }) => {
    const [zoomGroups, setZoomGroups] = useState<ColumnType[]>([]);

    const trpcUtils = api.useUtils();
    const { data: groupsData, isLoading: isGroupsLoading } = userId ? api.zoomGroups.getStudentZoomGroups.useQuery({ userId }) : api.zoomGroups.getzoomGroups.useQuery()
    const deleteMutation = api.zoomGroups.deleteZoomGroup.useMutation();
    const { toastError, toastSuccess } = useToast()

    const formattedData = groupsData?.zoomGroups.map((zoomGroup) => ({
        id: zoomGroup.id,
        course: zoomGroup.course!,
        courseLevel: zoomGroup.courseLevel!,
        createdAt: zoomGroup.createdAt,
        updatedAt: zoomGroup.updatedAt,
        groupNumber: zoomGroup.groupNumber,
        groupStatus: zoomGroup.groupStatus,
        startDate: zoomGroup.startDate,
        students: zoomGroup.students,
        studentsCount: zoomGroup.students.length,
        teacherName: zoomGroup.teacher?.user.name || "",
        teacher: zoomGroup.teacher!,
    })) || []

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(
            zoomGroups.map((zoomGroup) => zoomGroup.id),
            {
                onSuccess: () => {
                    trpcUtils.zoomGroups.invalidate()
                        .then(() => {
                            callback?.()
                            toastSuccess("Group(s) deleted")
                        })
                },
                onError: (error) => {
                    callback?.()
                    toastError(error.message)
                },
            }
        );
    };

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            skele={isGroupsLoading}
            setData={setZoomGroups}
            onDelete={onDelete}
            exportConfig={{
                fileName: "ZoomGroups",
                sheetName: "Zoom Groupsf",
            }}
            dateRanges={[{ key: "startDate", label: "Start Date" }]}
            searches={[
                { key: "groupNumber", label: "Group Number" },
            ]}
            filters={[
                {
                    key: "groupStatus",
                    filterName: "Group Status",
                    values: [...validGroupStatuses.map(status => ({
                        label: upperFirst(status),
                        value: status,
                    }))],
                },
                {
                    key: "teacherName",
                    filterName: "Trainer Name",
                    values: [...formattedData
                        .map(({ teacherName }) => teacherName)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(teacherName => ({
                            label: upperFirst(teacherName),
                            value: teacherName,
                        }))],
                },
            ]}
        />
    );
};

export default ZoomGroupsClient;

import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { type ColumnType, columns } from "./Column";
import { validGroupStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";

const ZoomGroupsClient = () => {
    const [zoomGroups, setZoomGroups] = useState<ColumnType[]>([]);

    const trpcUtils = api.useContext();
    const { data: groupsData, isLoading: isGroupsLoading } = api.zoomGroups.getzoomGroups.useQuery();
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
        trainerName: zoomGroup.trainer?.user.name || "",
        trainer: zoomGroup.trainer!,
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
            dateRange={{ key: "startDate", label: "Start Date" }}
            searches={[
                { key: "groupNumber", label: "Group Number" },
                { key: "trainerName", label: "Trainer" },
                { key: "studentsCount", label: "Students Count" },
            ]}
            filters={[{
                key: "groupStatus", filterName: "Group Status", values: [...validGroupStatuses.map(status => ({
                    label: upperFirst(status),
                    value: status,
                }))]
            }]}
        />
    );
};

export default ZoomGroupsClient;

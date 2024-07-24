import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { type ColumnType, columns } from "./Column";
import { validGroupStatuses } from "@/lib/enumsTypes";
import { Course, CourseLevel, Trainer, User, ZoomGroup, ZoomSession } from "@prisma/client";
import { upperFirst } from "lodash";

const ZoomGroupsClient = ({ zoomGroupsData }: {
    zoomGroupsData: (ZoomGroup & {
        trainer: (Trainer & {
            user: User;
        }) | null;
        course: Course | null;
        zoomSessions: ZoomSession[];
        students: User[];
        courseLevel: CourseLevel | null;
    })[];
}) => {
    const [zoomGroups, setZoomGroups] = useState<ColumnType[]>([]);

    const deleteMutation = api.zoomGroups.deleteZoomGroup.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

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
            data={zoomGroupsData.map((zoomGroup) => ({
                id: zoomGroup.id,
                course: zoomGroup.course!,
                courseLevel: zoomGroup.courseLevel!,
                createdAt: zoomGroup.createdAt,
                updatedAt: zoomGroup.updatedAt,
                groupNumber: zoomGroup.groupNumber,
                groupStatus: zoomGroup.groupStatus,
                startDate: zoomGroup.startDate,
                students: zoomGroup.students,
                trainer: zoomGroup.trainer!,
            }))}
            setData={setZoomGroups}
            onDelete={onDelete}
            searches={[{ key: "groupNumber", label: "Group Number" }]}
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

import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { ZoomGroupColumn, columns } from "./ZoomGroupsColumn";
import Spinner from "../Spinner";

const ZoomGroupsClient = () => {
    const { data, isLoading, isError } = api.zoomGroups.getzoomGroups.useQuery()

    const [zoomGroups, setZoomGroups] = useState<ZoomGroupColumn[]>([]);

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
                            callback && callback()
                            toastSuccess("Group(s) deleted")
                        })
                },
                onError: (error) => {
                    toastError(error.message)
                },
            }
        );
    };

    if (!data || isLoading) return <Spinner />
    if (isError) return <>Error</>

    return (
        <DataTable
            columns={columns}
            data={data.zoomGroups.map((zoomGroup) => ({
                id: zoomGroup.id,
                course: zoomGroup.course,
                createdAt: zoomGroup.createdAt,
                updatedAt: zoomGroup.updatedAt,
                groupNumber: zoomGroup.groupNumber,
                groupStatus: zoomGroup.groupStatus,
                startDate: zoomGroup.startDate,
                students: zoomGroup.students,
                trainer: zoomGroup.trainer,
            }))}
            setUsers={setZoomGroups}
            onDelete={onDelete}
        />
    );
};

export default ZoomGroupsClient;

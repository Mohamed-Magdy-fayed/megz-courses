import Spinner from '@/components/Spinner';
import { DataTable } from '@/components/ui/DataTable';
import { toastType, useToast } from '@/components/ui/use-toast';
import { meetingsColumns, SessionColumn } from '@/components/zoomAccount/zoomAccountMeetings/ZoomAccountMeetingsColumn';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function ZoomAccountMeetings({ meetings, isLoading }: {
    meetings: SessionColumn[];
    isLoading: boolean;
}) {
    const { toast } = useToast();

    const [data, setData] = useState<SessionColumn[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils();

    const deleteMutation = api.zoomSessions.deleteZoomSessions.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            variant: "info",
            description: (
                <Spinner className="h-4 w-4" />
            ),
            duration: 3000,
        })),
        onSuccess: () => trpcUtils.zoomAccounts.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `Session deleted successfully`,
            title: "Success"
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    });

    const onDelete = async (cb?: () => void) => {
        await deleteMutation.mutateAsync(data.map(s => s.id));
        cb?.()
    }

    return (
        <DataTable
            columns={meetingsColumns}
            data={meetings}
            setData={setData}
            onDelete={onDelete}
            skele={isLoading}
            dateRanges={[{ key: "sessionDate", label: "Start Time" }]}
            searches={[
                { key: "sessionTitle", label: "Topic" },
            ]}
            filters={[
                {
                    filterName: "Group", key: "groupName", values: meetings
                        .map(m => m.groupName || "Placement Test")
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(val => ({
                            label: val,
                            value: val,
                        }))
                },
                {
                    filterName: "Trainer", key: "trainerName", values: meetings
                        .map(m => m.trainerName)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(val => ({
                            label: val,
                            value: val,
                        }))
                },
            ]}
        />
    )
}

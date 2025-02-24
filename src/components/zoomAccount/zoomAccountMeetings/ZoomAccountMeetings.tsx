import Spinner from '@/components/Spinner';
import { DataTable } from '@/components/ui/DataTable';
import { toastType, useToast } from '@/components/ui/use-toast';
import { meetingsColumns, SessionColumn } from '@/components/zoomAccount/zoomAccountMeetings/ZoomAccountMeetingsColumn';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function ZoomAccountMeetings({ clientId, isUpcoming }: {
    clientId: string;
    isUpcoming?: boolean;
}) {
    const { toast } = useToast();
    const { data: accountMeetings, isLoading } = api.zoomAccounts.getAccountMeetings.useQuery({ id: clientId, isUpcoming })

    const [data, setData] = useState<SessionColumn[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils();
    const meetings = accountMeetings?.zoomSessions.map(session => ({
        id: session.id,
        sessionTitle: session.materialItem?.title || `${session.placementTest?.course.name} Placement test`,
        sessionDate: session.sessionDate,
        meetingNumber: session.meetingNumber,
        meetingPassword: session.meetingPassword,
        sessionStatus: session.sessionStatus,
        trainerId: session.zoomGroup?.teacher?.user.id || session.placementTest?.tester.user.id || "No Trainer",
        trainerName: session.zoomGroup?.teacher?.user.name || session.placementTest?.tester.user.name || "No Trainer",
        groupId: session.zoomGroup?.id || session.placementTest?.id,
        groupName: session.zoomGroup?.groupNumber || `Placement Test`,
        isTest: !!session.placementTest?.student.name,
        isZoom: !!session.zoomClient?.isZoom,
    })) || []

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
                {
                    filterName: "Session Status", key: "sessionStatus", values: meetings
                        .map(m => m.sessionStatus)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(val => ({
                            label: val,
                            value: val,
                        }))
                },
            ]}
            exportConfig={{ fileName: "Account Meetings", sheetName: "Meetings" }}
        />
    )
}

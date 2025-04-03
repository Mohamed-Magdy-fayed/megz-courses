import { DataTable } from '@/components/ui/DataTable';
import { toastType, useToast } from '@/components/ui/use-toast';
import { ZoomSessionsColumn, zoomSessionsColumns } from '@/components/admin/operationsManagement/zoomSessions/ZoomSessionsColumn';
import { api } from '@/lib/api';
import { createMutationOptions } from '@/lib/mutationsHelper';
import { useState } from 'react';

export default function ZoomSessionsClient({ isUpcoming }: { isUpcoming?: boolean }) {
    const { toast } = useToast();
    const { data: sessionsData, isLoading } = isUpcoming ? api.zoomSessions.getAllUpcomingSessions.useQuery() : api.zoomSessions.getAllSessions.useQuery()

    const meetings: ZoomSessionsColumn[] = sessionsData?.sessions.map(session => ({
        id: session.id,
        sessionTitle: session.materialItem?.title || `Placement test for ${session.placementTest?.course.name}`,
        sessionDate: session.sessionDate,
        meetingNumber: session.meetingNumber,
        meetingPassword: session.meetingPassword,
        sessionStatus: session.sessionStatus,
        trainerId: session.zoomGroup?.teacherId || session.placementTest?.testerId,
        trainerName: session.zoomGroup?.teacher?.user.name || session.placementTest?.tester.user.name || "No Trainer",
        groupId: session.groupId || undefined,
        groupName: session.zoomGroup ? "Zoom Group" : "Placement Test",
        isZoom: !!session.zoomClient?.isZoom,
        isTest: !!session.placementTest,
    })) || []

    const [data, setData] = useState<ZoomSessionsColumn[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils();

    const deleteMutation = api.zoomSessions.deleteZoomSessions.useMutation(
        createMutationOptions({
            trpcUtils,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: () => `Sessions deleted successfully`,
            loadingMessage: "Deleting..."
        })
    );

    const onDelete = async (cb?: () => void) => {
        await deleteMutation.mutateAsync(data.map(s => s.id));
        cb?.()
    }

    return (
        <DataTable
            columns={zoomSessionsColumns}
            data={meetings}
            setData={setData}
            onDelete={onDelete}
            isLoading={isLoading}
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
            exportConfig={{ fileName: "Zoom Sessions", sheetName: "Zoom Sessions" }}
        />
    )
}

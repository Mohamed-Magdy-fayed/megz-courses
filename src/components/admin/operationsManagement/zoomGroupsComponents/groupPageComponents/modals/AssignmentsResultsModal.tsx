import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatPercentage } from "@/lib/utils";

export default function AssignmentsResultsModal({ sessionId }: { sessionId: string; }) {
    const { data: assignments, isLoading, isError, error } = api.zoomGroups.getSessionQuizSubmissions.useQuery(sessionId, { enabled: sessionId.length === 12 })

    if (isLoading) return <Skeleton className="w-full h-96" />
    if (isError) return <Skeleton className="w-full h-96 animate-none" children={error.message} />

    return (

        <div className="space-y-4">
            <DataTable
                columns={[
                    {
                        accessorKey: "userId",
                        header: "Student",
                        cell: ({ row }) => <>{row.original.student.email}</>
                    },
                    {
                        accessorKey: "rating",
                        header: "Rating",
                        cell: ({ row }) => <>{formatPercentage(row.original.totalScore / row.original.systemForm.totalScore * 100)}</>
                    },
                ]}
                onDelete={() => { }}
                setData={() => { }}
                data={assignments}
            />
        </div>
    )
}

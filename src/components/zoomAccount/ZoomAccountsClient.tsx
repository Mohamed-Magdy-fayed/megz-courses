import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { AccountColumn, columns } from "@/components/zoomAccount/ZoomAccountColumn";

const ZoomAccountsClient = () => {
    const { data: zoomAccountsData } = api.zoomAccounts.getZoomAccounts.useQuery()

    const [accounts, setAccounts] = useState<AccountColumn[]>([]);
    const formattedData = zoomAccountsData?.zoomAccounts ? zoomAccountsData.zoomAccounts.map(({ createdAt, id, name, zoomSessions }) => ({
        id,
        name,
        zoomSessions: zoomSessions.map(session => ({
            status: session.sessionStatus,
            date: format(session.sessionDate, "PPPp"),
            attenders: session.attenders,
        })),
        createdAt: format(createdAt, "PPp"),
    })) : [];

    const { toastError, toastSuccess } = useToast();
    const trpcUtils = api.useUtils();
    const deleteMutation = api.zoomAccounts.deleteZoomAccounts.useMutation();

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(
            { ids: accounts.map((account) => account.id) },
            {
                onSuccess: () => {
                    trpcUtils.users.invalidate()
                        .then(() => {
                            toastSuccess("Account(s) deleted")
                            callback?.()
                        })
                },
                onError: ({ message }) => {
                    toastError(message);
                },
            }
        );
    };

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={setAccounts}
            onDelete={onDelete}
            dateRanges={[{ key: "createdAt", label: "Added On" }]}
            searches={[{ key: "name", label: "Name" }]}
        />
    );
};

export default ZoomAccountsClient;

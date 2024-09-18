import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { GoogleAccountColumn, columns } from "@/components/googleAccount/GoogleAccountCol";

const GoogleAccountsClient = () => {
    const { data: accountsData } = api.googleAccounts.getGoogleAccounts.useQuery()

    const [accounts, setAccounts] = useState<GoogleAccountColumn[]>([]);
    const formattedData = accountsData?.googleAccounts ? accountsData?.googleAccounts.map(({ createdAt, id, name }) => ({
        id,
        name,
        createdAt: format(createdAt, "PPp"),
    })) : [];

    const { toastError, toastSuccess } = useToast();
    const trpcUtils = api.useContext();
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

export default GoogleAccountsClient;

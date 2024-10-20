import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { format } from "date-fns";
import { toastType, useToast } from "@/components/ui/use-toast";
import { GoogleAccountColumn, columns } from "@/components/googleAccount/GoogleAccountCol";
import { createMutationOptions } from "@/lib/mutationsHelper";

const GoogleAccountsClient = () => {
    const { data: accountsData } = api.googleAccounts.getGoogleAccounts.useQuery()

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [accounts, setAccounts] = useState<GoogleAccountColumn[]>([]);
    const formattedData = accountsData?.googleAccounts ? accountsData?.googleAccounts.map(({ createdAt, id, name }) => ({
        id,
        name,
        createdAt: format(createdAt, "PPp"),
    })) : [];

    const { toast } = useToast();
    const trpcUtils = api.useUtils();
    const deleteMutation = api.googleAccounts.deleteGoogleAccounts.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ deletedGoogleAccounts }) => `Deleted ${deletedGoogleAccounts.count} accounts`
        })
    )

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids: accounts.map((account) => account.id) }, { onSuccess: () => callback?.() });
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

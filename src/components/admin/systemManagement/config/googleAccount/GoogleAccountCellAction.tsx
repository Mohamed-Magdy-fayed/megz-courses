import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDownIcon, RefreshCcwIcon, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/ui/Spinner";
import { AlertModal } from "@/components/general/modals/AlertModal";

interface GoogleAccountCellActionProps {
    id: string;
}

const GoogleAccountCellAction: React.FC<GoogleAccountCellActionProps> = ({ id }) => {
    const { toastInfo, toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useUtils();
    const deleteMutation = api.googleAccounts.deleteGoogleAccounts.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            variant: "info",
            description: (
                <Spinner className="h-4 w-4" />
            ),
            duration: 3000,
        })),
        onSuccess: () => trpcUtils.googleAccounts.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `Account deleted successfully`,
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
            setIsDeleteOpen(false)
        },
    });

    const refreshMutation = api.googleAccounts.refreshToken.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Refreshing...",
            variant: "info",
            description: (
                <Spinner className="h-4 w-4" />
            ),
            duration: 30000,
        })),
        onSuccess: () => trpcUtils.googleAccounts.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `Token refreshed successfully`,
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
            setIsDeleteOpen(false)
        },
    });

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] });
    };

    const onRefresh = () => {
        refreshMutation.mutate({ id });
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                description="This action is very high risk, any associated forms will lose functionality!"
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onRefresh}>
                        <RefreshCcwIcon className="w-4 h-4 mr-2" />
                        Refresh Token
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsDeleteOpen(true)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        <Typography>Delete</Typography>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default GoogleAccountCellAction;

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical, RefreshCcw, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/Spinner";
import { AlertModal } from "@/components/modals/AlertModal";

interface CellActionProps {
    id: string;
}

const CellAction: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo, toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    const trpcUtils = api.useContext();
    const refreshMutation = api.zoomMeetings.refreshToken.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 3000,
            }))
        },
        onSuccess: ({ updatedZoomClient }) => trpcUtils.zoomAccounts.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `${updatedZoomClient.name} zoom account token refreshed successfully`,
            title: "Success",
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
            duration: 2000,
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    })
    const deleteMutation = api.zoomAccounts.deleteZoomAccounts.useMutation({
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
        },
    });

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] });
    };

    const onRefreshAceessToken = () => {
        refreshMutation.mutate({ zoomClientId: id });
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onRefreshAceessToken}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh Acess Token
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

export default CellAction;

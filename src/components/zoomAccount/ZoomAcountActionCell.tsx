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
import ModalInDropdownMenu from "@/components/ui/modal-in-dropdown-menu";
import { Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/Spinner";

interface CellActionProps {
    id: string;
}

const CellAction: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo, toastError, toastSuccess, toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

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
                duration: 30000,
            }))
        },
        onSuccess: ({ updatedZoomClient }) => trpcUtils.zoomAccounts.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `${updatedZoomClient.name} zoom account token refreshed successfully`,
            title: "Success",
            duration: 2000,
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
            duration: 2000,
        }),
    })
    const deleteMutation = api.zoomAccounts.deleteZoomAccounts.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: () => {
            trpcUtils.zoomAccounts.invalidate()
                .then(() => toastSuccess("Account deleted"))
        },
        onError: ({ message }) => toastError(message),
        onSettled: () => {
            setLoading(false)
            setIsOpen(false)
        },
    });

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] });
    };

    const onRefreshAceessToken = () => {
        refreshMutation.mutate({ zoomClientId: id });
    };

    return (
        <DropdownMenu>
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
                <ModalInDropdownMenu
                    title="Are you sure?"
                    description="This delete action can't be undone!"
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onOpen={() => setIsOpen(true)}
                    children={(
                        <div className="flex items-center justify-end gap-4">
                            <Button disabled={loading} customeColor={"destructive"}>Cancel</Button>
                            <Button disabled={loading} onClick={onDelete} variant={"outline"} customeColor={"primaryOutlined"}>Confirm</Button>
                        </div>
                    )}
                    itemChildren={(
                        <>
                            <Trash className="w-4 h-4 mr-2" />
                            <Typography>Delete</Typography>
                        </>
                    )}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CellAction;

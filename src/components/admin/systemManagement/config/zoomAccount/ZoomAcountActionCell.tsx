import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, RefreshCcw, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/ui/Spinner";
import { AlertModal } from "@/components/general/modals/AlertModal";
import { createMutationOptions } from "@/lib/mutationsHelper";

interface CellActionProps {
    id: string;
    isZoom: "OnMeeting" | "Zoom";
}

const CellAction: React.FC<CellActionProps> = ({ id, isZoom }) => {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useUtils();
    const refreshOnMeetingTokenMutation = api.zoomAccounts.refreshOnMeetingToken.useMutation(
        createMutationOptions({
            loadingToast,
            toast,
            trpcUtils,
            setLoadingToast,
            successMessageFormatter: () => `Token refreshed`
        })
    )
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
            setIsDeleteOpen(false)
        },
    });

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] });
    };

    const onRefreshAceessToken = () => {
        if (isZoom === "Zoom") {
            return refreshMutation.mutate({ zoomClientId: id });
        }

        refreshOnMeetingTokenMutation.mutate({ id })
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                description="This action is very high risk, any associated sessions will lose Zoom account functionality!"
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

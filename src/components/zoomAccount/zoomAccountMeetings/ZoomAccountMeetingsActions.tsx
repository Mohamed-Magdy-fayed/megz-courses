import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ExternalLinkIcon, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/Spinner";
import { AlertModal } from "@/components/modals/AlertModal";
import Link from "next/link";
import { meetingLinkConstructor } from "@/lib/meetingsHelpers";

interface ZoomAccountMeetingsActionsProps {
    id: string;
    isZoom: boolean;
    sessionLink: string;
}

const ZoomAccountMeetingsActions: React.FC<ZoomAccountMeetingsActionsProps> = ({ id, isZoom, sessionLink }) => {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useUtils();
    const deleteMutation = api.zoomSessions.deleteZoomSessions.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            variant: "info",
            description: (
                <Spinner className="h-4 w-4" />
            ),
            duration: 60000,
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
            setIsDeleteOpen(false)
        },
    });

    const onDelete = () => {
        deleteMutation.mutate([id]);
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                description="This action is very high risk, any associated sessions will lose Zoom functionality!"
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
                    <DropdownMenuItem asChild>
                        <Link href={sessionLink}>
                            <ExternalLinkIcon className="w-4 h-4 mr-2" />
                            Join
                        </Link>
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

export default ZoomAccountMeetingsActions;

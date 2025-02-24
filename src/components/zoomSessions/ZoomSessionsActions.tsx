import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDownRightIcon, ChevronDownIcon, ExternalLinkIcon, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { Typography } from "@/components/ui/Typoghraphy";
import { AlertModal } from "@/components/modals/AlertModal";
import Link from "next/link";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { SessionStatus } from "@prisma/client";
import { validSessionStatuses } from "@/lib/enumsTypes";

interface ZoomSessionsActionsProps {
    id: string;
    isZoom: boolean;
    sessionLink: string;
    sessionStatus: SessionStatus;
}

const ZoomSessionsActions: React.FC<ZoomSessionsActionsProps> = ({ id, sessionStatus, sessionLink }) => {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useUtils();
    const deleteMutation = api.zoomSessions.deleteZoomSessions.useMutation(
        createMutationOptions({
            trpcUtils,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: () => `Session deleted successfully`
        })
    );
    const updateMutation = api.zoomSessions.editSessionStatus.useMutation(
        createMutationOptions({
            trpcUtils,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ updatedSession }) => `Session status is now ${updatedSession.sessionStatus}`
        })
    );

    const onDelete = () => {
        deleteMutation.mutate([id]);
    };

    const onUpdateStatus = (sessionStatus: SessionStatus) => {
        updateMutation.mutate({
            id,
            sessionStatus,
        });
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
                    <DropdownMenuGroup>
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
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Update Session Status</DropdownMenuLabel>
                        {validSessionStatuses.map(status => (
                            <DropdownMenuItem
                                key={status}
                                disabled={sessionStatus === status}
                                onClick={() => {
                                    onUpdateStatus(status)
                                }}
                            >
                                <ArrowDownRightIcon className="w-4 h-4 mr-2" />
                                <Typography>{status}</Typography>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ZoomSessionsActions;

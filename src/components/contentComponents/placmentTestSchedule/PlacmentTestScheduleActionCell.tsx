import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckSquare, Copy, MoreVertical, TargetIcon, Trash2Icon } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import SelectField from "@/components/ui/SelectField";
import Modal from "@/components/ui/modal";
import { env } from "@/env.mjs";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { AlertModal } from "@/components/modals/AlertModal";
import Link from "next/link";
import { meetingLinkConstructor } from "@/lib/meetingsHelpers";
import { Meeting } from "@prisma/client";

interface ActionCellProps {
    id: string;
    isLevelSubmitted: boolean;
    testLink: string;
    userId: string;
    courseId: string;
    courseLevels: { label: string, value: string }[]
    oralTestMeeting: Meeting;
}

const ActionCell: React.FC<ActionCellProps> = ({ courseId, courseLevels, id, isLevelSubmitted, testLink, userId, oralTestMeeting }) => {
    const { toastInfo, toast, toastError } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitLevelOpen, setIsSubmitLevelOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [level, setLevel] = useState<string[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()

    const trpcUtils = api.useUtils()
    const addToWaitingListMutation = api.waitingList.addToWaitingList.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ course, user }) => {
                setIsSubmitLevelOpen(false)
                return `Added Student ${user.name} to Waiting list of course ${course.name} at level ${courseLevels.find(courseLevel => courseLevel.value === level[0])?.label}`
            },
        })
    )
    const deleteMutation = api.placementTests.deletePlacementTest.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: () => {
                setIsDeleteOpen(false)
                return `deleted successfully!`
            },
        })
    )

    const onCopy = () => {
        navigator.clipboard.writeText(`${env.NEXT_PUBLIC_NEXTAUTH_URL}${testLink}`);
        toastInfo("Link copied to the clipboard");
    };

    const handleSubmitLevel = () => {
        if (!level[0]) return toastError("Please select a Level")
        addToWaitingListMutation.mutate({ courseId, levelId: level[0], userId })
    };

    const handleDelete = () => {
        deleteMutation.mutate({ id })
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                loading={!!loadingToast}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                description="This action can't be undone, Are you sure?"
            />
            <Modal
                title="Submit Student level"
                description="Select the appropriate level for the Student"
                isOpen={isSubmitLevelOpen}
                onClose={() => setIsSubmitLevelOpen(false)}
            >
                <div className="flex items-center justify-between p-2">
                    <SelectField
                        disabled={!!loadingToast}
                        placeholder="Select Level"
                        listTitle="Level"
                        values={level}
                        setValues={setLevel}
                        data={courseLevels.map(level => ({
                            Active: true,
                            ...level
                        }))}
                    />
                    <Button disabled={!!loadingToast} type="button" onClick={handleSubmitLevel}>Add to Waiting list</Button>
                </div>
            </Modal>
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/${meetingLinkConstructor({
                            meetingNumber: oralTestMeeting.meetingNumber,
                            meetingPassword: oralTestMeeting.meetingPassword,
                            sessionTitle: `Placement Test`
                        })}`}>
                            <TargetIcon className="w-4 h-4 mr-2" />
                            Join
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isLevelSubmitted} onClick={() => {
                        setIsOpen(false)
                        setIsSubmitLevelOpen(true)
                    }}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Submit Level
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!!loadingToast} onClick={() => {
                        setIsOpen(false)
                        setIsDeleteOpen(true)
                    }}>
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Delete Test
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;

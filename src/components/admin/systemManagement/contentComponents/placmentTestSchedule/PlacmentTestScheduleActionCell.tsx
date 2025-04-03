import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckSquare, Copy, ChevronDownIcon, TargetIcon, Trash2Icon } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { env } from "@/env.mjs";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { AlertModal } from "@/components/general/modals/AlertModal";
import Link from "next/link";
// import { Meeting } from "@prisma/client";
import SubmitLevelModal from "@/components/general/modals/SubmitLevelModal";

interface ActionCellProps {
    id: string;
    isLevelSubmitted: "Pending" | "Completed",
    courseName: string;
    testLink: string;
    oralTestLink: string | undefined;
    userId: string;
    courseId: string;
    courseLevels: { label: string, value: string }[]
    // oralTestMeeting: Meeting;
    oralTestQuestions: string | null;
}

const ActionCell: React.FC<ActionCellProps> = ({ courseId, courseLevels, id, courseName, isLevelSubmitted, testLink, userId, /*oralTestMeeting,*/oralTestLink, oralTestQuestions }) => {
    const { toastInfo, toast, toastError } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitLevelOpen, setIsSubmitLevelOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()
    const [level, setLevel] = useState<string>()
    const [oralFeedback, setOralFeedback] = useState("")

    const trpcUtils = api.useUtils()
    const addToWaitingListMutation = api.waitingList.addToWaitingList.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ course, user }) => {
                setIsSubmitLevelOpen(false)
                return `Added Student ${user.name} to Waiting list of course ${course.name} at level ${courseLevels.find(courseLevel => courseLevel.value === level)?.label}`
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
        if (!level) return toastError("Please select a Level")
        addToWaitingListMutation.mutate({ courseId, levelId: level, userId, oralFeedback })
    };

    const handleDelete = () => {
        deleteMutation.mutate({ ids: [id] })
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
            <SubmitLevelModal
                courseName={courseName}
                isOpen={isSubmitLevelOpen}
                setIsOpen={setIsSubmitLevelOpen}
                oralFeedback={oralFeedback}
                setOralFeedback={setOralFeedback}
                loading={!!loadingToast}
                level={level}
                setLevel={setLevel}
                courseLevels={courseLevels.map(l => ({ id: l.value, name: l.label }))}
                handleSubmitLevel={handleSubmitLevel}
                oralQuestions={oralTestQuestions}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild disabled={!oralTestLink || isLevelSubmitted === "Completed"}>
                        <Link href={oralTestLink ? `/${oralTestLink}` : ""}>
                            <TargetIcon className="w-4 h-4 mr-2" />
                            Join
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isLevelSubmitted === "Completed"} onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isLevelSubmitted === "Completed"} onClick={() => {
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

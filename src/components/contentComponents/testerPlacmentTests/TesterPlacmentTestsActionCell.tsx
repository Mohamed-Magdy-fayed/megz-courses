import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckSquare, Copy, ChevronDownIcon } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { Typography } from "@/components/ui/Typoghraphy";
import { CourseLevel } from "@prisma/client";
import SubmitLevelModal from "@/components/modals/SubmitLevelModal";

interface ActionCellProps {
    id: string;
    isLevelSubmitted: boolean;
    levelName: string;
    testLink: string;
    userId: string;
    courseId: string;
    courseName: string;
    courseLevels: CourseLevel[];
    oralTestQuestions: string | null;
}

const ActionCell: React.FC<ActionCellProps> = ({ testLink, courseId, courseName, userId, isLevelSubmitted, levelName, courseLevels, oralTestQuestions }) => {
    const { toastInfo, toast, toastError } = useToast();
    const [loading, setLoading] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [level, setLevel] = useState<string>()
    const [addToWaitingListToast, setAddToWaitingListToast] = useState<toastType>()
    const [oralFeedback, setOralFeedback] = useState("")

    const trpcUtils = api.useUtils()
    const addToWaitingListMutation = api.waitingList.addToWaitingList.useMutation({
        onMutate: () => {
            setAddToWaitingListToast(
                toast({
                    title: "Loading...",
                    description: <Spinner className="w-4 h-4" />,
                    duration: 100000,
                    variant: "info",
                })
            )
            setLoading(true)
        },
        onSuccess: ({ user, course }) => {
            addToWaitingListToast?.update({
                id: addToWaitingListToast.id,
                title: "Success",
                description: <Typography>
                    Added Student {user.name} to Waiting list of course {course.name} at level {levelName}
                </Typography>,
                duration: 3000,
                variant: "success",
            })
        },
        onError: ({ message }) => addToWaitingListToast?.update({
            id: addToWaitingListToast.id,
            title: "An error occured",
            description: message,
            duration: 3000,
            variant: "destructive",
        }),
        onSettled: () => {
            trpcUtils.invalidate().then(() => {
                setIsMenuOpen(false)
                setLoading(false)
                setIsOpen(false)
            })
        },
    })

    const onCopy = () => {
        navigator.clipboard.writeText(`${window.location.host}${testLink}`);
        toastInfo("Link copied to the clipboard");
    };

    const handleSubmitLevel = () => {
        if (!level) return toastError("Please select a Level")
        addToWaitingListMutation.mutate({ courseId, levelId: level, userId, oralFeedback })
    };

    return (
        <>
            <SubmitLevelModal
                courseName={courseName}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                oralFeedback={oralFeedback}
                setOralFeedback={setOralFeedback}
                loading={loading}
                level={level}
                setLevel={setLevel}
                courseLevels={courseLevels}
                handleSubmitLevel={handleSubmitLevel}
                oralQuestions={oralTestQuestions}
            />
            <DropdownMenu open={isMenuOpen} defaultOpen={false} key={`oaoksnd`} onOpenChange={(val) => setIsMenuOpen(val)} modal>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        disabled={isLevelSubmitted}
                        onClick={() => {
                            setIsOpen(true)
                            setIsMenuOpen(false)
                        }}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Submit Level
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;

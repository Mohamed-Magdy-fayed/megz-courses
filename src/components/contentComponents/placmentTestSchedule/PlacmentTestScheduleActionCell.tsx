import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckSquare, Copy, MoreVertical } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { Typography } from "@/components/ui/Typoghraphy";
import SelectField from "@/components/salesOperation/SelectField";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import Modal from "@/components/ui/modal";
import { env } from "@/env.mjs";
import { createMutationOptions } from "@/lib/mutationsHelper";

interface ActionCellProps {
    id: string;
    isLevelSubmitted: boolean;
    testLink: string;
    userId: string;
    courseId: string;
    courseLevels: { label: string, value: string }[]
}

const ActionCell: React.FC<ActionCellProps> = ({ courseId, courseLevels, id, isLevelSubmitted, testLink, userId }) => {
    const { toastInfo, toast, toastError } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitLevelOpen, setIsSubmitLevelOpen] = useState(false)
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
                sendWhatsAppMessage({
                    toNumber: `${user.phone}`,
                    textBody: `Hi ${user.name}, congtulations your placement test result for course ${course.name} has been submitted and placed you at level ${level}
            \nYou're now just one step away from starting your course.
            \nOur Team.`,
                })
                setIsSubmitLevelOpen(false)

                return `Added student ${user.name} to waiting list of course ${course.name} at level ${courseLevels.find(courseLevel => courseLevel.value === level[0])?.label}`
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

    return (
        <>
            <Modal
                title="Submit student level"
                description="Select the appropriate level for the student"
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
                            active: true,
                            ...level
                        }))}
                    />
                    <Button disabled={!!loadingToast} type="button" onClick={handleSubmitLevel}>Add to waiting list</Button>
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
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;

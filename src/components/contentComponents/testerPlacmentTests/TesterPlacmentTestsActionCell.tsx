import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckSquare, Copy, MoreVertical, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { CourseLevels } from "@prisma/client";
import ModalInDropdownMenu from "@/components/ui/modal-in-dropdown-menu";
import SelectField from "@/components/salesOperation/SelectField";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { Typography } from "@/components/ui/Typoghraphy";
import { sendWhatsAppMessage } from "@/lib/whatsApp";

interface ActionCellProps {
    id: string;
    isLevelSubmitted: boolean;
    testLink: string;
    userId: string;
    courseId: string;
    courseLevels: CourseLevels[]
}

const ActionCell: React.FC<ActionCellProps> = ({ id, testLink, courseId, userId, isLevelSubmitted, courseLevels }) => {
    const { toastInfo, toast, toastError } = useToast();
    const [loading, setLoading] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [level, setLevel] = useState<CourseLevels[]>([])
    const [addToWaitingListToast, setAddToWaitingListToast] = useState<toastType>()

    const trpcUtils = api.useContext()
    const addToWaitingListMutation = api.waitingList.addToWaitingList.useMutation({
        onMutate: () => {
            setAddToWaitingListToast(
                toast({
                    title: "Loading...",
                    description: <Spinner />,
                    duration: 100000,
                    variant: "info",
                })
            )
            setLoading(true)
        },
        onSuccess: ({ updatedUser, course, level }) => {
            addToWaitingListToast?.update({
                id: addToWaitingListToast.id,
                title: "Success",
                description: <Typography>
                    Added student {updatedUser.name} to waiting list of course {course.name} at level {level}
                </Typography>,
                duration: 3000,
                variant: "success",
            })
            sendWhatsAppMessage({
                toNumber: "201123862218",
                textBody: `Hi ${updatedUser.name}, congtulations your placement test result for course ${course.name} has been submitted and placed you at level ${level}
                \nYou're now just one step away from starting your course.
                \nOur Team.`,
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
        if (!level[0]) return toastError("Please select a Level")
        addToWaitingListMutation.mutate({ courseId, level: level[0], userId })
    };

    return (
        <DropdownMenu open={isMenuOpen} defaultOpen={false} key={`oaoksnd`} onOpenChange={(val) => setIsMenuOpen(val)} modal>
            <DropdownMenuTrigger asChild>
                <Button customeColor="mutedIcon" variant={"icon"} >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <ModalInDropdownMenu
                    disabled={isLevelSubmitted}
                    title="Submit student level"
                    description="Select the appropriate level for the student"
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onOpen={() => setIsOpen(true)}
                    itemChildren={(
                        <>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Submit Level
                        </>
                    )}
                >
                    <div className="flex items-center justify-between">
                        <SelectField
                            disabled={loading}
                            placeholder="Select Level"
                            listTitle="Level"
                            values={level}
                            setValues={setLevel}
                            data={courseLevels.map(level => ({
                                active: true,
                                label: level,
                                value: level,
                            }))}
                        />
                        <Button type="button" onClick={handleSubmitLevel}>Add to waiting list</Button>
                    </div>
                </ModalInDropdownMenu>
                <DropdownMenuItem onClick={onCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOpen(true)}>
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActionCell;

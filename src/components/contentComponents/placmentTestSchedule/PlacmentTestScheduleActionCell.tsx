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
import { CourseLevels } from "@prisma/client";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { Typography } from "@/components/ui/Typoghraphy";
import ModalInDropdownMenu from "@/components/ui/modal-in-dropdown-menu";
import SelectField from "@/components/salesOperation/SelectField";

interface ActionCellProps {
    id: string;
    isLevelSubmitted: boolean;
    testLink: string;
    userId: string;
    courseId: string;
    courseLevels: CourseLevels[]
}

const ActionCell: React.FC<ActionCellProps> = ({ courseId, courseLevels, id, isLevelSubmitted, testLink, userId }) => {
    const { toastInfo, toast, toastError } = useToast();
    const [loading, setLoading] = useState(false)
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
        onSuccess: ({ updatedUser, course, level }) => addToWaitingListToast?.update({
            id: addToWaitingListToast.id,
            title: "Success",
            description: <Typography>
                Adde student {updatedUser.name} to waiting list of course {course.name} at level {level}
            </Typography>,
            duration: 3000,
            variant: "success",
        }),
        onError: ({ message }) => addToWaitingListToast?.update({
            id: addToWaitingListToast.id,
            title: "An error occured",
            description: message,
            duration: 3000,
            variant: "destructive",
        }),
        onSettled: () => {
            trpcUtils.invalidate().then(() => {
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
        console.log(level);
        if (!level[0]) return toastError("Please select a Level")
        addToWaitingListMutation.mutate({ courseId, level: level[0], userId })
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
                    Copy Link
                </DropdownMenuItem>
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActionCell;

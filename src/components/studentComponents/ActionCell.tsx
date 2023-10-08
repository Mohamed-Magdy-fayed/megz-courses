import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash, SearchSlash, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Modal from "../ui/modal";
import { Course, Level, Lesson } from "@prisma/client";
import email from "next-auth/providers/email";
import SelectField from "../salesOperation/SelectField";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface CellActionProps {
    id: string;
}

const CellAction: React.FC<CellActionProps> = ({ id }) => {
    const { data } = api.courses.getStudentCourses.useQuery({ userId: id });
    const { toast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [testId, setTestId] = useState<string[]>([]);
    const [score, setScore] = useState(0);

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toast({
            description: "Category ID copied to the clipboard",
            variant: "info"
        });
    };

    const trpcUtils = api.useContext()
    const updatePlacementFormTestScoreMutation = api.placementTests.updatePlacementFormTestScore.useMutation()

    const handleAddCoursPlacementResult = () => {
        if (!testId[0] || !score) return toast({
            description: `missing some info here!`,
            variant: "destructive"
        })
        setLoading(true);

        updatePlacementFormTestScoreMutation.mutate({ score, testId: testId[0] }, {
            onSuccess: (data) => {
                console.log(data);
            },
            onError: (e) => {
                console.log(e);
            },
            onSettled: () => {
                trpcUtils.courses.invalidate()
                    .then(() => {
                        setOpen(false)
                        setLoading(false);
                    })
            },
        })
    }

    return (
        <>
            <Modal
                title="Add placement test result"
                description="select cours to add result"
                isOpen={open}
                onClose={() => setOpen(false)}
            >
                <div className="flex items-center justify-between">
                    <div className="space-y-4 [&>*]:w-full">
                        {!data?.courses ? (<></>) : (
                            <SelectField
                                values={testId}
                                setValues={setTestId}
                                placeholder="Select Course..."
                                listTitle="Courses"
                                data={
                                    data.user.placementTests
                                        .filter(test => !test.testStatus.form)
                                        .map(test => ({
                                            label: data.courses.find(course => course.id === test.courseId)?.name || "",
                                            value: test.id
                                        }))
                                } />
                        )}
                        <div className="mt-4">
                            <Label>Score</Label>
                            <Input
                                min={"1"}
                                value={score}
                                type="number"
                                onChange={(e) => setScore(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="space-x-2 mt-auto">
                        <Button disabled={loading} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                            setTestId([])
                        }}>
                            Clear
                        </Button>
                        <Button disabled={loading} onClick={handleAddCoursPlacementResult}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => setOpen(true)}
                    >
                        <SearchSlash className="w-4 h-4 mr-2" />
                        Placement Test
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;

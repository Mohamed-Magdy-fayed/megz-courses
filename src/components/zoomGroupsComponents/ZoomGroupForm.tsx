import { api } from "@/lib/api";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { useToast } from "../ui/use-toast";
import SelectField from "../salesOperation/SelectField";
import Spinner from "../Spinner";
import { DatePicker } from "../ui/DatePicker";

interface ZoomGroupFormProps {
    setIsOpen: (val: boolean) => void;
}
const ZoomGroupForm: React.FC<ZoomGroupFormProps> = ({ setIsOpen }) => {
    const [loading, setLoading] = useState(false);
    const [courseId, setCourseId] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);
    const [trainerId, setTrainerId] = useState<string[]>([]);
    const [date, setDate] = useState<Date>();

    const title = "Create Zoom Group";
    const description = "Add a new Group";
    const action = "Create";

    const { data: trainersData } = api.trainers.getTrainers.useQuery();
    const { data: coursesData } = api.courses.getAll.useQuery();
    const createZoomGroupMutation = api.zoomGroups.createZoomGroup.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

    const onSubmit = () => {
        setLoading(true);

        createZoomGroupMutation.mutate({
            courseId: courseId[0]!,
            startDate: date!,
            studentIds: userIds,
            trainerId: trainerId[0]!,
        }, {
            onSuccess: (data) => {
                trpcUtils.zoomGroups.invalidate();
                toastSuccess(`Group ${data.zoomGroup.groupNumber} created successfully!`)
                setIsOpen(false);
                setLoading(false);
            },
            onError: (error) => {
                toastError(error.message)
                setLoading(false);
            },
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <div className="space-y-2 flex-col flex">
                    <Typography className="text-left text-xl font-medium">
                        {title}
                    </Typography>
                    <Typography className="text-left text-sm">
                        {description}
                    </Typography>
                </div>
                <Button
                    disabled={loading}
                    variant="x"
                    customeColor={"destructive"}
                    onClick={() => setIsOpen(false)}
                    type="button"
                >
                    <X />
                </Button>
            </div>
            <Separator />
            <div className="flex p-4 items-center gap-4 h-full">
                {!trainersData || !coursesData ? <Spinner className="w-fit" /> : (
                    <>
                        <SelectField
                            values={trainerId}
                            setValues={setTrainerId}
                            placeholder="Select Trainer..."
                            listTitle="Trainers"
                            data={trainersData.trainers.map(trainer => ({ active: trainer.groups.length < 10, label: trainer.user.email, value: trainer.id }))} />
                        <SelectField
                            values={courseId}
                            setValues={setCourseId}
                            placeholder="Select Course..."
                            listTitle="Courses"
                            data={coursesData.courses.map(course => ({ active: true, label: course.name, value: course.id }))} />
                        {!courseId[0] ? null : (
                            <SelectField
                                multiSelect
                                values={userIds}
                                setValues={setUserIds}
                                placeholder="Select Users..."
                                listTitle="Users"
                                data={coursesData.courses.find(course => course.id === courseId[0])?.orders.map(order => ({
                                    active: order.user.courseStatus.find((status) => status.courseId === courseId[0])?.state === "waiting",
                                    label: order.user.email,
                                    value: order.user.id
                                }))!} />
                        )}
                        {userIds.length < 3 ? null : (
                            <DatePicker
                                date={date}
                                setDate={setDate}
                            />
                        )}
                    </>

                )}
            </div>
            <Separator></Separator>
            <div className="flex p-4 justify-end items-center gap-4 h-full">
                <Button
                    disabled={loading}
                    customeColor="destructive"
                    onClick={() => setIsOpen(false)}
                    type="button"
                >
                    <Typography variant={"buttonText"}>Cancel</Typography>
                </Button>
                <Button
                    disabled={loading}
                    customeColor="accent"
                >
                    <Typography variant={"buttonText"}>Reset</Typography>
                </Button>
                <Button disabled={loading} onClick={onSubmit}>
                    <Typography variant={"buttonText"}>{action}</Typography>
                </Button>
            </div>
        </div >
    );
};

export default ZoomGroupForm;

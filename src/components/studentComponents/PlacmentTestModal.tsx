import { useState } from 'react'
import Modal from '../ui/modal'
import SelectField from '../salesOperation/SelectField'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { api } from '@/lib/api'
import { useToast } from '../ui/use-toast'
import { SearchSlash } from 'lucide-react'

const PlacmentTestModal = ({ id }: { id: string }) => {
    const { data } = api.courses.getStudentCourses.useQuery({ userId: id });
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [testId, setTestId] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [open, setOpen] = useState(false);

    const trpcUtils = api.useContext()
    const updatePlacementFormTestScoreMutation = api.placementTests.updatePlacementFormTestScore.useMutation()

    const handleAddCoursPlacementResult = () => {
        if (!testId[0] || !score) return toastError(`missing some info here!`)
        setLoading(true);

        updatePlacementFormTestScoreMutation.mutate({ score, testId: testId[0] }, {
            onSuccess: (data) => {
                console.log(data);
            },
            onError: (error) => {
                toastError(error.message)
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
            <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-2 hover:bg-slate-100'
            >
                <SearchSlash className="w-4 h-4 mr-2" />
                Placement Test
            </button>
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
                                            value: test.id,
                                            active: true,
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
        </>
    )
}

export default PlacmentTestModal
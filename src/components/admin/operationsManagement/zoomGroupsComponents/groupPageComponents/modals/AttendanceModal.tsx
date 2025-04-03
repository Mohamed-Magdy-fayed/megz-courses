import { Button } from '@/components/ui/button';
import SelectField from '@/components/ui/SelectField';
import { Typography } from '@/components/ui/Typoghraphy';
import { toastType, useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { createMutationOptions } from '@/lib/mutationsHelper';
import { Dispatch, SetStateAction, useState } from 'react';

export default function AttendanceModal({ attendersLength, groupStudents, sessionId, studentIds, setSessionId, setStudentIds }: {
    sessionId: string;
    setSessionId: Dispatch<SetStateAction<string>>;
    studentIds: string[];
    setStudentIds: Dispatch<SetStateAction<string[]>>;
    groupStudents: { email: string; id: string; }[];
    attendersLength: number;
}) {
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const setSessionAttendanceMutation = api.zoomGroups.setSessionAttendance.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils: trpcUtils.zoomGroups,
            successMessageFormatter: ({ updatedSession }) => {
                setSessionId("")
                return `${updatedSession.attenders.length} students attended the session`
            }
        })
    )

    const handleSetAttendance = () => {
        setSessionAttendanceMutation.mutate({
            sessionId,
            studentIds,
        })
    }

    return (
        <div className="space-y-4">
            <SelectField
                disabled={!!loadingToast}
                multiSelect
                data={groupStudents.map(student => ({
                    Active: true,
                    label: student.email,
                    value: student.id,
                }))}
                listTitle="Students"
                placeholder="Search students"
                values={studentIds}
                setValues={setStudentIds}
            />
            <div className="flex items-center gap-4 justify-end">
                {attendersLength > 0 ? (
                    <Typography className="mr-auto">
                        <Button
                            variant={"icon"}
                            customeColor={"infoIcon"}
                            disabled
                        >
                            {attendersLength}
                        </Button>
                        students attended already
                    </Typography>
                ) : null}
                <Button
                    disabled={!!loadingToast}
                    onClick={handleSetAttendance}
                    customeColor={"primary"}
                >
                    Submit
                </Button>
            </div>
        </div>

    )
}

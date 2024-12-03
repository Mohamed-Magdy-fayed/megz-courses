import SingleSelectCourses from '@/components/SingleSelectCourse'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Modal from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { toastType, useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { createMutationOptions } from '@/lib/mutationsHelper'
import { Dispatch, SetStateAction, useState } from 'react'

const CreateOrderModal = ({ leadId, email, isOpen, setIsOpen }: {
    leadId: string | undefined;
    email: string | undefined;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const [courseId, setCourseId] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const { toast } = useToast()
    const trpcUtils = api.useUtils()

    const createOrderMutation = api.orders.createOrder.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ orderNumber }) => {
                setIsOpen(false)
                return `Order ${orderNumber} Created successfully!`
            }
        })
    )

    const handleCreateOrder = () => {
        if (!leadId || !email) return toast({ title: "Error", variant: "destructive", description: "No User or Lead Created!" })
        createOrderMutation.mutate({
            courseDetails: {
                courseId,
                isPrivate,
            },
            email,
            leadId,
        })
    }

    return (
        <Modal
            title="Create Order"
            description="select a course to create an order"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-4 [&>*]:w-full">
                    <SingleSelectCourses
                        loading={false}
                        courseId={courseId}
                        setCourseId={setCourseId}
                    />
                    <div className="flex items-center space-x-2">
                        <Switch checked={isPrivate} onCheckedChange={(val) => setIsPrivate(val)} id="isPrivate" />
                        <Label htmlFor="isPrivate">Private Class?</Label>
                    </div>
                </div>
                <div className="space-x-2 mt-auto flex">
                    <Button disabled={!!loadingToast} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                        setCourseId("")
                    }}>
                        Clear
                    </Button>
                    <Button disabled={!!loadingToast} onClick={handleCreateOrder}>
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default CreateOrderModal
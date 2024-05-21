import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useState } from "react";
import UserInfoPanel from "@/components/salesOperation/UserInfoPanel";
import OperationStatus from "@/components/salesOperation/OperationStatus";
import OrderInfoPanel from "@/components/salesOperation/OrderInfoPanel";
import CreateOrder from "@/components/salesOperation/CreateOrder";
import { Loader } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Spinner";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const OperationPage = () => {
    const router = useRouter()
    const id = router.query.operationId as string
    const { data, isLoading, isError } = api.salesOperations.getById.useQuery({ id })
    const { data: coursesData } = api.courses.getAll.useQuery()
    const { data: usersData } = api.users.getUsers.useQuery({ userType: "student" })

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toastSuccess, toastError } = useToast()

    const session = useSession()
    const trpcUtils = api.useContext()
    const updateSalesOperationMutation = api.salesOperations.editSalesOperations.useMutation()
    const createPlacementTestMutation = api.placementTests.startCourses.useMutation()

    const handleCompleteOperation = () => {
        setLoading(true)
        if (!data?.salesOperations?.orderDetails) return
        createPlacementTestMutation.mutate({
            userId: data?.salesOperations?.orderDetails?.userId,
            courseIds: data?.salesOperations?.orderDetails?.courseIds,
        }, {
            onSuccess: (data) => {
                updateSalesOperationMutation.mutate({
                    id,
                    status: "completed"
                }, {
                    onSettled: () => {
                        trpcUtils.salesOperations.invalidate()
                            .then(() => {
                                toastSuccess(`${data.placementTests.count} Placement tests created!`)
                                setLoading(false)
                            })
                    }
                })
            },
            onError: (error) => {
                toastError(error.message);
                setLoading(false)
            },
        })
    }

    return (
        <AppLayout>
            {isLoading ? (
                <div className="w-full grid place-content-center">
                    <Loader className="animate-spin" size={100}></Loader>
                </div>
            ) : isError ? (
                <div className="text-error">Error!</div>
            ) : !data.salesOperations ? (
                <div className="text-error">Error!</div>
            ) : (
                <>
                    <OperationStatus data={data.salesOperations} />
                    <div className="py-4">
                        <ConceptTitle>User Details</ConceptTitle>
                        {<UserInfoPanel data={data.salesOperations} />}
                    </div>
                    <div className="py-4">
                        <ConceptTitle>Order Details</ConceptTitle>
                        {<OrderInfoPanel data={data.salesOperations} />}
                    </div>
                    <div className="flex">
                        {coursesData && usersData && (
                            <CreateOrder
                                salesOperationId={id}
                                coursesData={coursesData.courses}
                                loading={loading}
                                open={open}
                                setLoading={setLoading}
                                setOpen={setOpen}
                                usersdata={usersData.users}
                            />
                        )}
                        {data.salesOperations.orderDetails !== null && (
                            <Button
                                disabled={
                                    loading
                                    || data.salesOperations.status === "completed"
                                    || data.salesOperations.orderDetails.status !== "paid"
                                    || (
                                        session.data?.user.id !== data.salesOperations.assignee?.userId
                                        && session.data?.user.userType !== "admin"
                                    )
                                }
                                onClick={handleCompleteOperation}
                                className="bg-success hover:bg-success/90"
                            >
                                <Typography className={cn("", loading && "opacity-0")}>Complete</Typography>
                                {loading && <Spinner className="w-4 h-4 absolute" />}
                            </Button>
                        )}
                        <Button
                            disabled={
                                data.salesOperations.status !== "ongoing"
                                || data.salesOperations.orderDetails !== null
                                || !(session.data?.user.id === data.salesOperations.assignee?.userId
                                    || session.data?.user.userType === "admin")
                            }
                            onClick={() => setOpen(true)}
                            className="ml-auto"
                        >
                            <Typography className={cn("", loading && "opacity-0")}>Add Courses</Typography>
                            {loading && <Spinner className="w-4 h-4 absolute" />}
                        </Button>
                    </div>
                </>
            )}
        </AppLayout>
    )
}

export default OperationPage
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import UserInfoPanel from "@/components/salesOperation/UserInfoPanel";
import OperationStatus from "@/components/salesOperation/OperationStatus";
import OrderInfoPanel from "@/components/salesOperation/OrderInfoPanel";
import CreateOrder from "@/components/salesOperation/CreateOrder";
import { Loader } from "lucide-react";

const OperationPage: NextPage = () => {
    const id = useRouter().query.operationId as string
    const { data, isLoading, isError } = api.salesOperations.getById.useQuery({ id })
    const { data: coursesData } = api.courses.getAll.useQuery()
    const { data: usersData } = api.users.getUsers.useQuery({ userType: "student" })

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const trpcUtils = api.useContext()
    const updateSalesOperationMutation = api.salesOperations.editSalesOperations.useMutation()


    const handleCompleteOperation = () => {
        setLoading(true)
        updateSalesOperationMutation.mutate({
            id,
            status: "completed"
        }, {
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                    .then(() => setLoading(false))
            }
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
                                disabled={loading || data.salesOperations.status === "completed"}
                                onClick={handleCompleteOperation}
                                className="bg-success hover:bg-success/90"
                            >
                                Complete
                            </Button>
                        )}
                        <Button
                            disabled={data.salesOperations.status !== "ongoing" || data.salesOperations.orderDetails !== null}
                            onClick={() => setOpen(true)}
                            className="ml-auto"
                        >
                            Add Courses
                        </Button>
                    </div>
                </>
            )}
        </AppLayout>
    )
}

export default OperationPage
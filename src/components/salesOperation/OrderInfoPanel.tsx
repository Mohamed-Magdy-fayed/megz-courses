import { formatPrice } from "@/lib/utils";
import { SalesOperation, SalesAgent, Order, Course, User } from "@prisma/client";
import { PaperContainer } from "../ui/PaperContainers";
import { Typography } from "../ui/Typoghraphy";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { DataTable } from "../ui/DataTable";
import CellAction from "./ActionCell";
import { PaymentForm } from "./PaymentForm";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import Modal from "@/components/ui/modal";
import { RefundModal } from "@/components/modals/RefundModal";

const OrderInfoPanel = ({ data }: {
    data: SalesOperation & {
        assignee: (SalesAgent & {
            user: User;
        }) | null;
        orderDetails: (Order & {
            user: User;
            course: Course;
        }) | null;
    }
}) => {
    const color = (): SeverityPillProps["color"] => {
        switch (data.orderDetails?.status) {
            case "cancelled":
                return "destructive"
            case "refunded":
                return "primary";
            case "paid":
                return "success";
            case "pending":
                return "muted";
            default:
                return "destructive"
        }
    }

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

    const refundedByUser = api.users.getUserById.useQuery({ id: data.orderDetails?.refundRequester || "" }, { enabled: false });

    useEffect(() => {
        if (data.orderDetails?.refundRequester) refundedByUser.refetch()
    }, [data.orderDetails?.refundRequester])

    return (
        <PaperContainer className="mt-4 p-4">
            {!!data.orderDetails?.id && (
                <RefundModal
                    isOpen={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    orderId={data.orderDetails?.id}
                />
            )}
            <Modal
                title="Manual Payment"
                description="please upload the proof of the payment amount"
                isOpen={open}
                onClose={() => setOpen(false)}
                children={
                    <PaymentForm
                        loading={loading}
                        setLoading={setLoading}
                        onClose={() => setOpen(false)}
                        id={data.orderDetails?.id}
                    />
                }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold">Order Number: </Typography>
                        <Typography>{data.orderDetails?.orderNumber || "NA"}</Typography>
                    </div>
                    {data.orderDetails?.status && (
                        <DataTable
                            data={[{
                                status: data.orderDetails?.status,
                                total: data.orderDetails?.amount!,
                                id: data.orderDetails.paymentId,
                                orderId: data.orderDetails.id,
                                paymentLink: data.orderDetails.paymentLink,
                                refundedBy: refundedByUser?.data?.user.email
                            }]}
                            onDelete={() => { }}
                            setData={() => { }}
                            columns={[
                                {
                                    accessorKey: "status", header: () => "Status", cell: ({ row }) => (
                                        <div className="flex flex-col gap-2">
                                            {row.original.status === "refunded" ? (
                                                <div className="flex gap-2 items-center">
                                                    <SeverityPill className="max-w-[6rem] flex-grow" color={color()}>{row.original.status}</SeverityPill>
                                                    <Tooltip>
                                                        <TooltipTrigger >
                                                            <Info />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <Typography>Refunded by: {row.original.refundedBy}</Typography>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <SeverityPill className="max-w-[6rem]" color={color()}>{row.original.status}</SeverityPill>
                                            )}
                                        </div>
                                    )
                                },
                                { accessorKey: "total", header: () => "Amount", cell: ({ row }) => <>{formatPrice(row.original.total)}</> },
                                { id: "actions", header: () => "Actions", cell: ({ row }) => <CellAction setIsRefundModalOpen={setIsRefundModalOpen} id={row.original.id} paymentLink={row.original.paymentLink} status={row.original.status} orderId={row.original.orderId} setOpen={setOpen} />, },
                            ]}
                        />
                    )}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold">Course</Typography>
                        <Typography>{data.orderDetails?.course.name || "NA"}</Typography>
                    </div>
                    {data.orderDetails?.course && (
                        <DataTable
                            data={[data.orderDetails?.course]}
                            onDelete={() => { }}
                            setData={() => { }}
                            columns={[
                                {
                                    accessorKey: "name",
                                    header: "Name",
                                    cell: ({ row }) => <>{row.original.name}</>
                                },
                                {
                                    accessorKey: "price",
                                    header: "Price",
                                    cell: ({ row }) => <>{
                                        formatPrice(data.orderDetails?.courseType.isPrivate
                                            ? row.original.privatePrice
                                            : row.original.groupPrice)
                                    }</>
                                },
                            ]}
                        />
                    )}
                </div>
            </div>
        </PaperContainer>
    )
}

export default OrderInfoPanel
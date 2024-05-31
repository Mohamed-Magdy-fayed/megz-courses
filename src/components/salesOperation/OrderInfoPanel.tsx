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

const OrderInfoPanel = ({ data }: {
    data: SalesOperation & {
        assignee: (SalesAgent & {
            user: User;
        }) | null;
        orderDetails: (Order & {
            user: User;
            courses: Course[];
        }) | null;
    }
}) => {
    const color = (): SeverityPillProps["color"] => {
        switch (data.orderDetails?.status) {
            case "cancelled":
                return "destructive"
            case "refunded":
                return "destructive";
            case "paid":
                return "primary";
            case "pending":
                return "muted";
            default:
                return "destructive"
        }
    }

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const refundedByUser = api.users.getUserById.useQuery({ id: data.orderDetails?.refundRequester || "" }, { enabled: false });

    useEffect(() => {
        if (data.orderDetails?.refundRequester) refundedByUser.refetch()
    }, [data.orderDetails?.refundRequester])

    return (
        <PaperContainer className="mt-4 p-4">
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
                                refundedBy: refundedByUser?.data?.user.email
                            }]}
                            onDelete={() => { }}
                            setUsers={() => { }}
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
                                { id: "actions", header: () => "Actions", cell: ({ row }) => <CellAction id={row.original.id} status={row.original.status} orderId={row.original.orderId} setOpen={setOpen} />, },
                            ]}
                        />
                    )}
                    <PaymentForm
                        isOpen={open}
                        loading={loading}
                        setLoading={setLoading}
                        onClose={() => setOpen(false)}
                        id={data.orderDetails?.id}
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold">Courses</Typography>
                        <Typography>{data.orderDetails?.courses.length || "NA"}</Typography>
                    </div>
                    {data.orderDetails?.courses && (
                        <DataTable
                            data={data.orderDetails?.courses}
                            onDelete={() => { }}
                            setUsers={() => { }}
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
                                        formatPrice(data.orderDetails?.courseTypes.find(({ id }) => id === row.original.id)?.isPrivate
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
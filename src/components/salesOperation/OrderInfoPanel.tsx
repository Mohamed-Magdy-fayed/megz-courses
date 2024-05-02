import { formatPrice } from "@/lib/utils";
import { SalesOperation, SalesAgent, Order, Course, User } from "@prisma/client";
import { PaperContainer } from "../ui/PaperContainers";
import { Typography } from "../ui/Typoghraphy";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { DataTable } from "../ui/DataTable";
import CellAction from "./ActionCell";
import { PaymentForm } from "./PaymentForm";
import { useState } from "react";

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
            case "done":
                return "success";
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
                            }]}
                            onDelete={() => { }}
                            setUsers={() => { }}
                            columns={[
                                { accessorKey: "status", header: () => "Status", cell: ({ row }) => <><SeverityPill className="max-w-[6rem]" color={color()}>{row.original.status}</SeverityPill></> },
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
                                { accessorKey: "name", header: "Name", cell: ({ row }) => <>{row.original.name}</> },
                                { accessorKey: "price", header: "Price", cell: ({ row }) => <>{formatPrice(row.original.price)}</> },
                            ]}
                        />
                    )}
                </div>
            </div>
        </PaperContainer>
    )
}

export default OrderInfoPanel
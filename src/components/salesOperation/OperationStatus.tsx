import { api } from "@/lib/api";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/zustand/store";
import { Typography, CircularProgress, Avatar } from "@mui/material";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { format } from "date-fns";
import { Link } from "lucide-react";
import { useState } from "react";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const OperationStatus = ({ data }: {
    data: (SalesOperation & {
        assignee: SalesAgent & {
            user: User
        } | null;
        orderDetails: (Order & {
            user: User;
            courses: Course[];
        }) | null;
    })
}) => {
    const statusMap: {
        created: "primary";
        assigned: "warning";
        ongoing: "info";
        completed: "success";
        cancelled: "error";
    } = {
        created: "primary",
        assigned: "warning",
        ongoing: "info",
        completed: "success",
        cancelled: "error"
    };

    const [isLoading, setIsLoading] = useState(false)
    const toast = useToastStore()

    const updatedAt = format(data.updatedAt, "dd-MMMM-yy");
    const orderStatus = data.status as keyof typeof statusMap;

    const editMutation = api.salesOperations.editSalesOperations.useMutation()
    const trpcUtils = api.useContext()

    const handleStatusChange = (status: "created" | "assigned" | "ongoing" | "completed" | "cancelled") => {
        setIsLoading(true)
        editMutation.mutate({ id: data.id, status }, {
            onSuccess: (data) => {
                console.log(data);
                toast.success(`Operation ${data.updatedSalesOperations.code} is now ${data.updatedSalesOperations.status}!`)
            },
            onError: (error) => {
                console.log(error);
                toast.error(`unable to change operation status!`)
            },
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                setIsLoading(false)
            }
        })
    }

    return (
        <div className="space-y-4">
            <ConceptTitle>Operation Code: {data.code}</ConceptTitle>
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <SeverityPill
                        color={statusMap[orderStatus]}
                        label={orderStatus}
                    />
                    <Typography>Latest update: {updatedAt}</Typography>
                </div>
                {data.status === "assigned" ? (
                    <Button disabled={isLoading} onClick={() => handleStatusChange("ongoing")} className={cn("self-end", isLoading && "text-gray-500 border-gray-500 pointer-events-none")} variant={"outline"}>
                        {isLoading ? <CircularProgress /> : "Start"}
                    </Button>
                ) : data.status === "ongoing" ? (
                    <Button disabled={isLoading || data.orderDetails !== null} onClick={() => handleStatusChange("cancelled")} className={cn("self-end border-error text-error hover:bg-error", isLoading && "text-gray-500 border-gray-500 pointer-events-none")} variant={"outline"}>
                        {isLoading ? <CircularProgress size={25} color="inherit" /> : "Cancel"}
                    </Button>
                ) : (
                    <Tooltip>
                        <Link className="group hidden sm:flex items-center gap-4" href={`/account/${data.assignee?.user.id}`}>
                            <Typography className="group-hover:text-primary">
                                {data.assignee?.user.email}
                            </Typography>
                            <Avatar src={data.assignee?.user.image as string}>
                                {getInitials(data.assignee?.user.name)}
                            </Avatar>
                        </Link>
                        <TooltipTrigger className="sm:hidden">
                            <Link href={`/account/${data.assignee?.user.id}`}>
                                <Avatar src={data.assignee?.user.image as string}>
                                    {getInitials(data.assignee?.user.name)}
                                </Avatar>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            {data.assignee?.user.email}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

export default OperationStatus

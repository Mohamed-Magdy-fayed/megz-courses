import { api } from "@/lib/api";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/utils";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { format } from "date-fns";
import { useState } from "react";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Spinner from "../Spinner";

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
        assigned: "primary";
        ongoing: "info";
        completed: "success";
        cancelled: "destructive";
    } = {
        created: "primary",
        assigned: "primary",
        ongoing: "info",
        completed: "success",
        cancelled: "destructive"
    };

    const [isLoading, setIsLoading] = useState(false)

    const updatedAt = format(data.updatedAt, "dd-MMMM-yy");
    const orderStatus = data.status as keyof typeof statusMap;

    const editMutation = api.salesOperations.editSalesOperations.useMutation()
    const trpcUtils = api.useContext()
    const sesstion = useSession()
    const { toastError, toastSuccess } = useToast()

    const handleStatusChange = (status: "created" | "assigned" | "ongoing" | "completed" | "cancelled") => {
        setIsLoading(true)
        editMutation.mutate({ id: data.id, status }, {
            onSuccess: (data) => {
                toastSuccess(`Operation ${data.updatedSalesOperations.code} is now ${data.updatedSalesOperations.status}!`)
            },
            onError: (error) => {
                toastError(error.message)
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
                    <SeverityPill color={statusMap[orderStatus]}>
                        {orderStatus}
                    </SeverityPill>
                    <Typography>Latest update: {updatedAt}</Typography>
                </div>
                <div className="flex gap-4 items-center ">
                    {data.status !== "cancelled" && data.status !== "completed" && (sesstion.data?.user.id === data.assignee?.userId
                        || sesstion.data?.user.userType === "admin") && (
                            <Button
                                customeColor={"destructive"}
                                disabled={isLoading}
                                onClick={() => handleStatusChange("cancelled")}
                            >
                                <Typography className={cn(isLoading && "opacity-0")}>Cancel</Typography>
                                {isLoading && <Spinner className="w-6 h-6 absolute" />}
                            </Button>
                        )}
                    {data.status === "assigned"
                        && (sesstion.data?.user.id === data.assignee?.userId
                            || sesstion.data?.user.userType === "admin") ? (
                        <Button
                            customeColor={"primaryOutlined"}
                            disabled={isLoading}
                            onClick={() => handleStatusChange("ongoing")}
                            className={cn("self-end")}
                            variant={"outline"}>
                            <Typography className={cn(isLoading && "opacity-0")}>Start</Typography>
                            {isLoading && <Spinner className="w-6 h-6 absolute" />}
                        </Button>
                    ) : data.status === "completed" ? (
                        <Tooltip>
                            <Link className="group hidden sm:flex items-center gap-4" href={`/account/${data.assignee?.user.id}`}>
                                <Typography className="group-hover:text-primary">
                                    {data.assignee?.user.email}
                                </Typography>
                                <Avatar>
                                    <AvatarImage src={data.assignee?.user.image as string} />
                                    <AvatarFallback>
                                        {getInitials(data.assignee?.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <TooltipTrigger className="sm:hidden">
                                <Link href={`/account/${data.assignee?.user.id}`}>
                                    <Avatar>
                                        <AvatarImage src={data.assignee?.user.image as string} />
                                        <AvatarFallback>
                                            {getInitials(data.assignee?.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                {data.assignee?.user.email}
                            </TooltipContent>
                        </Tooltip>
                    ) : <></>}
                </div>
            </div>
        </div>
    )
}

export default OperationStatus

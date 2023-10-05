import { getInitials } from "@/lib/getInitials";
import { Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { PaperContainer } from "../ui/PaperContainers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";

const UserInfoPanel = ({ data }: {
    data: SalesOperation & {
        assignee: (SalesAgent & {
            user: User;
        }) | null;
        orderDetails: (Order & {
            user: User;
        }) | null;
    }
}) => {
    return (
        <PaperContainer className="mt-4 p-4">
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex gap-4 items-center">
                    <Avatar>
                        <AvatarImage />
                        <AvatarFallback>
                            {getInitials(data.orderDetails?.user.name) || "NA"}
                        </AvatarFallback>
                    </Avatar>
                    <Typography>{data.orderDetails?.user.name || "NA"}</Typography>
                </div>
                <div className="flex gap-4 items-center">
                    <Typography>Email: {data.orderDetails?.user.email || "NA"}</Typography>
                    <Typography>Phone: {data.orderDetails?.user.phone || "NA"}</Typography>
                </div>
            </div>
        </PaperContainer>
    )
}

export default UserInfoPanel
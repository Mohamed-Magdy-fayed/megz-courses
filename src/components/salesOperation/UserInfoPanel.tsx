import { getInitials } from "@/lib/getInitials";
import { PaperContainer } from "../ui/PaperContainers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { Prisma } from "@prisma/client";

const UserInfoPanel = ({ data }: {
    data: Prisma.LeadGetPayload<{
        include: {
            assignee: { include: { user: true } },
            orderDetails: { include: { user: true, course: true } },
        }
    }>
}) => {
    return (
        <PaperContainer className="mt-4 p-4 flex-grow">
            <div className="space-y-4 flex flex-col">
                <div className="flex gap-4 items-center">
                    <Avatar>
                        <AvatarImage />
                        <AvatarFallback>
                            {getInitials(data.orderDetails?.user.name) || "NA"}
                        </AvatarFallback>
                    </Avatar>
                    <Typography>{data.orderDetails?.user.name || "NA"}</Typography>
                </div>
                <div className="flex gap-4 flex-col">
                    <Typography>Email: {data.orderDetails?.user.email || "NA"}</Typography>
                    <Typography>Phone: {data.orderDetails?.user.phone || "NA"}</Typography>
                </div>
            </div>
        </PaperContainer>
    )
}

export default UserInfoPanel
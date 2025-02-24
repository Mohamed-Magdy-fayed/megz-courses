import { getInitials } from "@/lib/getInitials"
import { FC } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Typography } from "../ui/Typoghraphy"
import Link from "next/link"

interface AssigneeCellProps {
    assigneeId: string
    assigneeName: string
    assigneeImage: string
    assigneeEmail: string
}

const AssigneeCell: FC<AssigneeCellProps> = ({ assigneeId, assigneeEmail, assigneeImage, assigneeName }) => {
    return (
        <div>
            {!assigneeEmail ? <>No Assignee</> : (
                <Link href={`/admin/users_management/account/${assigneeId}`} className="flex flex-row gap-4 items-center hover:text-primary">
                    <Avatar>
                        <AvatarImage src={`${assigneeImage}`} />
                        <AvatarFallback>
                            {getInitials(`${assigneeName}`)}
                        </AvatarFallback>
                    </Avatar>
                    <Typography className="font-normal">{assigneeEmail}</Typography>
                </Link>
            )}
        </div>
    )
}

export default AssigneeCell
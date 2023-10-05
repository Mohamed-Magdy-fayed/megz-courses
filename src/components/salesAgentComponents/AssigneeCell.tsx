import { api } from "@/lib/api"
import { getInitials } from "@/lib/getInitials"
import { FC } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Typography } from "../ui/Typoghraphy"
import Link from "next/link"

interface AssigneeCellProps {
    assigneeId: string
}

const AssigneeCell: FC<AssigneeCellProps> = ({ assigneeId }) => {
    const { data, isLoading, isError } = api.users.getUserById.useQuery({ id: assigneeId })
    return (
        <div>
            {isLoading ? <>Loading...</> : isError ? <>No Assignee</> : (
                <Link href={`/account/${assigneeId}`} className="flex flex-row gap-4 items-center hover:text-primary">
                    <Avatar>
                        <AvatarImage src={`${data.user?.image}`} />
                        <AvatarFallback>
                            {getInitials(`${data.user?.name}`)}
                        </AvatarFallback>
                    </Avatar>
                    <Typography className="font-normal">{data.user?.email}</Typography>
                </Link>
            )}
        </div>
    )
}

export default AssigneeCell
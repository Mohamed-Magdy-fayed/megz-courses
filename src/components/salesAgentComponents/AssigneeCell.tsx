import { api } from "@/lib/api"
import { getInitials } from "@/lib/getInitials"
import { Avatar } from "@mui/material"
import { FC } from "react"

interface AssigneeCellProps {
    assigneeId: string
}

const AssigneeCell: FC<AssigneeCellProps> = ({ assigneeId }) => {
    const { data, isLoading, isError } = api.users.getUserById.useQuery({ id: assigneeId })
    return (
        <div>
            {isLoading ? <>Loading...</> : isError ? <>No Assignee</> : (
                <div className="flex flex-row gap-4 items-center">
                    <Avatar src={`${data.user?.image}` || ""}>
                        {getInitials(`${data.user?.name}` || "")}
                    </Avatar>
                    {data.user?.email}
                </div>
            )}
        </div>
    )
}

export default AssigneeCell
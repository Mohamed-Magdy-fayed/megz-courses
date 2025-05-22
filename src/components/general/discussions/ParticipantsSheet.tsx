import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import UserAvatar from '@/components/ui/user/UserAvatar'
import WrapWithTooltip from '@/components/ui/wrap-with-tooltip'
import { cn } from '@/lib/utils'
import { User } from '@prisma/client'
import { MoreHorizontalIcon } from 'lucide-react'
import { InfoIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export default function ParticipantsSheet({ participants }: { participants: { id: string, user: User }[] }) {
    const router = useRouter()
    const { groupId } = router.query

    const { data: sessionData } = useSession()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="ml-auto" customeColor="info">
                    Participants
                    <InfoIcon size={20} className="ml-2" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Participants</SheetTitle>
                    <SheetDescription>
                        {participants.map((participant) => {
                            const isCurrentUser = participant.user.id === sessionData?.user.id
                            const isCurrentUserStudent = sessionData?.user.userRoles.includes("Student")

                            return (
                                <div key={participant.id} className="flex items-center gap-2">
                                    <UserAvatar src={participant.user.image || ""} />
                                    <div>
                                        <Link
                                            href={`${isCurrentUserStudent ? "/student/my_account/" : "/admin/users_management/account/"}${!isCurrentUserStudent ? participant.user.id : ""}`}
                                            className={cn("font-semibold text-base in-table-link", (isCurrentUserStudent && !isCurrentUser) && "pointer-events-none")}
                                        >
                                            {participant.user.name}
                                        </Link>
                                        <div className="text-xs text-muted">{participant.user.email}</div>
                                    </div>
                                    <DropdownMenu>
                                        <WrapWithTooltip text="Actions">
                                            <DropdownMenuTrigger className="ml-auto">
                                                <MoreHorizontalIcon size={20} />
                                            </DropdownMenuTrigger>
                                        </WrapWithTooltip>
                                        <DropdownMenuContent side='bottom' align='end'>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {!isCurrentUser && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`${isCurrentUserStudent ? "/student/discussions/" : "/admin/operations_management/discussions/"}${groupId}/${participant.user.id}`} className="w-full">
                                                        Private Discussion
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem>Mute</DropdownMenuItem>
                                            <DropdownMenuItem>Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )
                        })}
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

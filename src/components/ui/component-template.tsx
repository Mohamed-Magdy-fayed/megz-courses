"use client"

import React from 'react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/getInitials'
import { useSession } from 'next-auth/react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const ComponentTemplate = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        const user = useSession().data?.user

        if (!user) return <Skeleton className="w-full h-12" />

        const { name, email, image } = user

        return (
            <div ref={ref} className={cn("group flex items-center gap-2 px-1 py-2 text-left text-sm", className)} {...props}>
                <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={image || undefined} alt={name} />
                    <AvatarFallback className="rounded-lg">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <Link
                        href={email ? "/admin/users_management/account" : "/student/my_account"}
                        className="truncate font-semibold group-hover:text-primary"
                    >
                        {name}
                    </Link>
                    <span className="truncate text-xs">{email}</span>
                </div>
            </div>
        )
    }
)

ComponentTemplate.displayName = "ComponentTemplate"

export { ComponentTemplate }

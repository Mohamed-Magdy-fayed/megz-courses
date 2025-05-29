"use client"

import React from 'react'
import { SystemFormTypes } from '@prisma/client'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

const DisplaySubmissionBadge = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Badge> & { id: string; type: SystemFormTypes }>(
    ({ className, id, type, ...props }, ref) => {
        const { data } = api.systemFormSubmissions.getByRelationId.useQuery({ id, type })

        if (!data) return null

        return (
            <Badge className={cn("text-success-foreground bg-success p-1 h-4 group-data-[isActive=false]:bg-success/50", className)} {...props} children={<CheckIcon size={12} />} />
        )
    }
)

DisplaySubmissionBadge.displayName = "DisplaySubmissionBadge"

export { DisplaySubmissionBadge }

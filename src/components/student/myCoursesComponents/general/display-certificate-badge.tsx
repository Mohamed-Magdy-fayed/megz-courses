"use client"

import React from 'react'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

const DisplayCertificateBadge = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Badge> & { id: string }>(
    ({ className, id, ...props }, ref) => {
        const { data } = api.certificates.getCertificateByLevelId.useQuery({ id })

        if (!data) return null

        return (
            <Badge className={cn("text-success-foreground bg-success p-1 h-4 group-data-[isActive=false]:bg-success/50", className)} {...props} children={<CheckIcon size={12} />} />
        )
    }
)

DisplayCertificateBadge.displayName = "DisplayCertificateBadge"

export { DisplayCertificateBadge }

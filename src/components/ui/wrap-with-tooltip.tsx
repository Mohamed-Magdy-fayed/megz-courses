import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import React, { ReactNode } from 'react'

const WrapWithTooltip = ({ children, text }: { children: ReactNode, text: string }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                {text}
            </TooltipContent>
        </Tooltip>
    )
}

export default WrapWithTooltip
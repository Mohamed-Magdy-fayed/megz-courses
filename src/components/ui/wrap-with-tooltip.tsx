import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import React, { ReactNode } from 'react'

const WrapWithTooltip = ({ children, text, delay }: { children: ReactNode, text: string | ReactNode, delay?: number }) => {
    return (
        <Tooltip delayDuration={delay}>
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
"use client"

import * as React from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type SidebarNavAction = {
    onClick: () => void
    label: string
    icon: React.ReactNode
    disabled?: boolean
}

export type SidebarNavActionGroup = {
    label?: string
    items: SidebarNavAction[]
}

export type SidebarNavActionsProps = Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>, "children"> & {
    actions?: SidebarNavAction[]
    actionGroups?: SidebarNavActionGroup[]
    menuLabel?: string
    icon?: React.ReactNode
}

export const SidebarNavActions = React.forwardRef<HTMLButtonElement, SidebarNavActionsProps>(
    ({
        className,
        actions,
        actionGroups,
        menuLabel = "Actions",
        icon = <MoreHorizontalIcon size={20} />,
        ...props
    }, ref) => {
        if (!actions && !actionGroups) return null
        
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild ref={ref} className={cn("flex items-center gap-2 text-sm", className)} {...props}>
                    <Button variant="icon" customeColor="primaryIcon">
                        {icon}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {actionGroups && actionGroups.length > 0 ? (
                        actionGroups.map((group, groupIdx) => (
                            <React.Fragment key={groupIdx}>
                                {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
                                {group.items.map((action, idx) => (
                                    <DropdownMenuItem key={idx} onClick={action.onClick} disabled={action.disabled}>
                                        {action.icon}
                                        <span className="ml-2">{action.label}</span>
                                    </DropdownMenuItem>
                                ))}
                                {groupIdx < actionGroups.length - 1 && <DropdownMenuSeparator />}
                            </React.Fragment>
                        ))
                    ) : actions && actions.length > 0 ? (
                        <>
                            {menuLabel && <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>}
                            <DropdownMenuSeparator />
                            {actions.map((action, idx) => (
                                <DropdownMenuItem key={idx} onClick={action.onClick} disabled={action.disabled}>
                                    {action.icon}
                                    <span className="ml-2">{action.label}</span>
                                </DropdownMenuItem>
                            ))}
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
)

SidebarNavActions.displayName = "SidebarNavActions"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center space-x-2 active:opacity-75 justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
            },
            customeColor: {
                background: "bg-background text-background-foreground",
                foreground: "bg-foreground text-foreground-foreground",
                primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
                accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
                muted: "bg-muted text-muted-foreground",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
                success: "bg-success text-success-foreground hover:bg-success-hover",
                info: "bg-info text-info-foreground hover:bg-info-hover",
                backgroundOutlined: "text-background hover:border-foreground border-background",
                foregroundOutlined: "text-foreground hover:border-background border-foreground",
                primaryOutlined: "text-primary hover:bg-primary hover:text-primary-foreground border-primary",
                secondaryOutlined: "text-secondary hover:bg-secondary hover:text-secondary-foreground border-secondary",
                accentOutlined: "text-accent hover:bg-accent hover:text-accent-foreground border-accent",
                mutedOutlined: "text-muted hover:bg-muted hover:text-muted-foreground border-muted",
                destructiveOutlined: "text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive",
                successOutlined: "text-success hover:bg-success hover:text-success-foreground border-success",
                infoOutlined: "text-info hover:bg-info hover:text-info-foreground border-info",
                backgroundIcon: "text-primary hover:bg-primary/20 border-primary",
                foregroundIcon: "text-foreground hover:bg-foreground/20 border-foreground",
                primaryIcon: "text-primary hover:bg-primary/20 border-primary",
                secondaryIcon: "text-secondary hover:bg-secondary/20 border-secondary",
                accentIcon: "text-accent hover:bg-accent/20 border-accent",
                mutedIcon: "text-muted hover:bg-muted/20 border-muted",
                destructiveIcon: "text-destructive hover:bg-destructive/20 border-destructive",
                successIcon: "text-success hover:bg-success/20 border-success",
                infoIcon: "text-info border-info hover:bg-info/20",
            },
            variant: {
                default: "",
                outline: "border bg-transparent",
                link: "bg-inhirit text-info hover:text-info hover:bg-inhirit underline-offset-4 hover:underline p-0 w-fit h-fit space-x-0",
                x: "p-1 rounded-full w-6 h-6 bg-transparent text-destructive hover:bg-destructive/20",
                icon: "rounded-full border-0 !p-0 aspect-square !h-8 !w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            customeColor: "primary",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, customeColor, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className, customeColor }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

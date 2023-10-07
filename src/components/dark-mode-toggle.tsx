"use client"

import * as React from "react"
import { Moon, Settings2Icon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function DarkModeToggle() {
    const { setTheme } = useTheme()

    return (
        <TooltipProvider>
            <div className="flex items-center gap-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="icon" customeColor={"primaryIcon"} onClick={() => setTheme("light")}>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90" />
                            <span className="sr-only">Light theme</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Light theme</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="icon" customeColor="mutedIcon" onClick={() => setTheme("dark")}>
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Dark theme</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Dark theme</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="icon" customeColor="infoIcon" onClick={() => setTheme("system")}>
                            <Settings2Icon className="absolute h-[1.2rem] w-[1.2rem] transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">System theme</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>System theme</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}

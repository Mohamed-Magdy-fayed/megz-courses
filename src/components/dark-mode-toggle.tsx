"use client"

import { Moon, Settings2Icon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip"

export function DarkModeToggle() {
    const { setTheme } = useTheme()

    return (
            <div className="flex items-center justify-evenly gap-4 w-full">
                <WrapWithTooltip text="Light theme">
                    <Button variant="icon" customeColor={"primaryIcon"} onClick={() => setTheme("light")}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90" />
                        <span className="sr-only">Light theme</span>
                    </Button>
                </WrapWithTooltip>
                <WrapWithTooltip text="Dark theme">
                    <Button variant="icon" customeColor="foregroundIcon" onClick={() => setTheme("dark")}>
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Dark theme</span>
                    </Button>
                </WrapWithTooltip>
                <WrapWithTooltip text="System theme">
                    <Button variant="icon" customeColor="infoIcon" onClick={() => setTheme("system")}>
                        <Settings2Icon className="absolute h-[1.2rem] w-[1.2rem] transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">System theme</span>
                    </Button>
                </WrapWithTooltip>
            </div>
    )
}

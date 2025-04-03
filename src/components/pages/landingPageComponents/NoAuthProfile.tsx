import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { LogIn, UserPlus, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export const DesktopUnauthenticatedProfileMenu = () => {

    return (
        <div className="hidden md:flex col-span-4 items-center gap-4 justify-end">
            <Link href={`/authentication?variant=login`}>
                <Button customeColor={"successIcon"}>
                    <Typography className="text-foreground">Login</Typography>
                    <LogIn />
                </Button>
            </Link>
            <Link href={`/authentication?variant=register`}>
                <Button customeColor={"primaryIcon"}>
                    <Typography className="text-foreground">Register</Typography>
                    <UserPlus />
                </Button>
            </Link>
        </div>
    )
}

export const MobileUnauthenticatedProfileMenu = () => {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden flex col-span-4 items-center gap-4 justify-end">
            <DropdownMenu
                open={open}
                onOpenChange={(val) => setOpen(val)}
            >
                <DropdownMenuTrigger asChild>
                    <Button variant={"icon"} customeColor={"primaryIcon"}>
                        <Menu />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="md:hidden flex flex-col gap-4">
                    <Link href={`/authentication?variant=login`}>
                        <Button customeColor={"successIcon"} className="w-full justify-start">
                            <Typography className="text-foreground">Login</Typography>
                            <LogIn />
                        </Button>
                    </Link>
                    <Link href={`/authentication?variant=register`}>
                        <Button customeColor={"primaryIcon"} className="w-full justify-start">
                            <Typography className="text-foreground">Register</Typography>
                            <UserPlus />
                        </Button>
                    </Link>
                    <DropdownMenuSeparator className="md:hidden" />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
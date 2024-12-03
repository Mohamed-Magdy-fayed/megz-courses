import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Dispatch, FC, SetStateAction, useState } from "react"
import { api } from "@/lib/api"
import { ScrollArea } from "./ui/scroll-area"
import Spinner from "./Spinner"

interface SelectUserProps {
    loading: boolean
    userEmail: string
    setUserEmail: Dispatch<SetStateAction<string>>
}

const SelectUser: FC<SelectUserProps> = ({ userEmail, setUserEmail, loading }) => {
    const { data, isLoading, isError } = api.users.getUsers.useQuery({ userRole: "Student" })

    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={loading}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex gap-2 justify-between hover:bg-slate-50 hover:text-primary hover:border-primary"
                >
                    {userEmail
                        ? userEmail
                        : "Select user..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4">
                <Command>
                    <CommandInput placeholder="Search courses..." />
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-60">
                            {isLoading ? (
                                <div className="grid place-content-center">
                                    <Spinner></Spinner>
                                </div>
                            ) : isError ? (
                                <>Error!</>
                            ) : data.users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    onSelect={(currentValue) => {
                                        setUserEmail(prev => prev === currentValue ? "" : currentValue)
                                    }}
                                    value={user.email}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            userEmail === user.email ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {user.email}
                                </CommandItem>
                            ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default SelectUser

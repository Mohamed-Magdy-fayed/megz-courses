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
import { Dispatch, SetStateAction, useState } from "react"
import { ScrollArea } from "./ui/scroll-area"

interface SingleSelectFieldProps<T extends string> {
    title: string;
    isLoading: boolean;
    data: {
        label: string;
        value: T;
    }[];
    selected: T | undefined
    setSelected: Dispatch<SetStateAction<T | undefined>>;
}

function SingleSelectField<T extends string>({ selected, setSelected, isLoading, data, title }: SingleSelectFieldProps<T>) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={isLoading}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex gap-2 bg-background hover:bg-background justify-between text-inherit hover:text-primary hover:border-primary"
                >
                    {!!selected
                        ? selected
                        : `Select ${title}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4">
                <Command>
                    <CommandInput placeholder={`Search ${title}...`} />
                    <CommandEmpty>No title found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea>
                            {data.map((item, i) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setSelected(currentValue as T)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default SingleSelectField

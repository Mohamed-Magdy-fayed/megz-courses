import { Check, ChevronDownIcon, ChevronsDownIcon, ChevronsUpDown } from "lucide-react"

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
import { Dispatch, ReactNode, SetStateAction, useState } from "react"
import { ScrollArea } from "./ui/scroll-area"
import Spinner from "@/components/Spinner"

interface SingleSelectFieldProps<T> {
    title: string | ReactNode;
    placeholder: string;
    isLoading: boolean;
    data: {
        label: string;
        value: T;
        customLabel?: ReactNode;
        Active?: boolean;
    }[];
    selected: T | undefined
    setSelected: Dispatch<SetStateAction<T | undefined>>;
    disableSearch?: boolean
}

function SingleSelectField<T>({ selected, setSelected, isLoading, placeholder, data, title, disableSearch }: SingleSelectFieldProps<T>) {
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
                    {selected !== undefined
                        ? data.find(d => d.value === selected)?.label
                        : placeholder}
                    {isLoading ? <Spinner size={20} /> : <ChevronDownIcon className="h-4 w-4 opacity-50 ml-auto" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4" avoidCollisions collisionPadding={20}>
                <Command>
                    {!disableSearch && <CommandInput placeholder={placeholder} />}
                    <CommandEmpty>No redults.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-60">
                            {data.map((item, i) => (
                                <CommandItem
                                    key={`${item.value}`}
                                    disabled={item.Active === false}
                                    onSelect={() => {
                                        setSelected(item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.customLabel ? item.customLabel : item.label}
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

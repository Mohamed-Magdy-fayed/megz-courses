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
import { ScrollArea } from "@/components/ui/scroll-area"
import Spinner from "@/components/ui/Spinner"
import { Typography } from "@/components/ui/Typoghraphy"

interface MultiSelectFieldProps<T> {
    title: string | ReactNode;
    placeholder: string;
    disabled: boolean;
    isLoading: boolean;
    data: {
        label: string;
        value: T;
        customLabel?: ReactNode;
        active?: boolean;
    }[];
    selected: T[]
    setSelected: Dispatch<SetStateAction<T[]>>;
    disableSearch?: boolean
}

function MultiSelectField<T>({ selected, setSelected, isLoading, disabled, placeholder, data, title, disableSearch }: MultiSelectFieldProps<T>) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={isLoading || disabled}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex w-full gap-2 bg-background hover:bg-background justify-between text-inherit hover:text-primary hover:border-primary"
                >
                    <Typography className="whitespace-pre-wrap">
                        {selected.length > 0
                        ? data.filter(d => selected.includes(d.value)).reduce((acc, curr) => acc + (curr.label) + ", ", "").slice(0, -2)
                        : placeholder}
                        </Typography>
                    {isLoading && !disabled ? <Spinner size={20} /> : <ChevronDownIcon className="h-4 w-4 opacity-50 ml-auto" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4" avoidCollisions collisionPadding={20}>
                <Command>
                    {!disableSearch && <CommandInput placeholder={placeholder} />}
                    <CommandEmpty>No results.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-60">
                            {data.map((item, i) => (
                                <CommandItem
                                    key={`${item.value}`}
                                    disabled={item.active === false}
                                    onSelect={(e) => {
                                        setSelected(selected.includes(item.value) ? [...selected.filter(i => i !== item.value)] : [...selected, item.value])
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(item.value) ? "opacity-100" : "opacity-0"
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

export default MultiSelectField

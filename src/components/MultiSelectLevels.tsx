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

interface MultiSelectProps {
    courses: string[]
    loading: boolean
    levels: string[]
    setLevels: Dispatch<SetStateAction<string[]>>
}

const MultiSelectCourses: FC<MultiSelectProps> = ({ courses, levels, setLevels, loading }) => {
    const { data, isLoading, isError } = api.levels.getAll.useQuery({ where: { id: { in: courses } } })

    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={loading}
                    variant="outline"
                    customeColor={"foregroundOutlined"}
                    role="combobox"
                    aria-expanded={open}
                    className="flex gap-2 justify-between  hover:text-primary hover:border-primary"
                >
                    {levels.length === 1
                        ? `${levels[0]}`
                        : levels.length === 2
                            ? `${levels[0]} and 1 other`
                            : levels.length > 2
                                ? `${levels[0]} and ${levels.length - 1} others`
                                : "Select course..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4">
                <Command>
                    <CommandInput placeholder="Search levels..." />
                    <CommandEmpty>No levels found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea>
                            {isLoading ? (
                                <div className="grid place-content-center">
                                    <Spinner></Spinner>
                                </div>
                            ) : isError ? (
                                <>Error!</>
                            ) : data.levels.map((course) => (
                                <CommandItem
                                    key={course.id}
                                    onSelect={(currentValue) => {
                                        setLevels((prevValue) => {
                                            return prevValue.includes(currentValue) ? prevValue.filter(v => v !== currentValue) : [...prevValue, currentValue]
                                        })
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            levels.includes(course.name.toLocaleLowerCase()) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {course.name}
                                </CommandItem>
                            ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default MultiSelectCourses

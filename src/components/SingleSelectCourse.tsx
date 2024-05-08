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

interface SingleSelectProps {
    loading: boolean
    courseId: string
    setCourseId: Dispatch<SetStateAction<string>>
}

const SingleSelectCourses: FC<SingleSelectProps> = ({ courseId, setCourseId, loading }) => {
    const { data, isLoading, isError } = api.courses.getAll.useQuery()

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
                    {courseId
                        ? `${courseId}`
                        : "Select course..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4">
                <Command>
                    <CommandInput placeholder="Search courses..." />
                    <CommandEmpty>No courses found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea>
                            {isLoading ? (
                                <div className="grid place-content-center">
                                    <Spinner></Spinner>
                                </div>
                            ) : isError ? (
                                <>Error!</>
                            ) : data.courses.map((course) => (
                                <CommandItem
                                    key={course.id}
                                    onSelect={(currentValue) => {
                                        setCourseId(currentValue)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            courseId === course.id ? "opacity-100" : "opacity-0"
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

export default SingleSelectCourses

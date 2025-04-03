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
import { Dispatch, FC, SetStateAction, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import Spinner from "@/components/ui/Spinner"

interface SingleSelectProps {
    loading: boolean
    courseId: string
    setCourseId: Dispatch<SetStateAction<string>>
}

const SingleSelectCourse: FC<SingleSelectProps> = ({ courseId, setCourseId, loading }) => {
    const { data, isLoading, isError } = api.courses.getAll.useQuery()

    const [open, setOpen] = useState(false)
    const [searchVal, setSearchVal] = useState("")

    const selectedCourseName = useMemo(() => data?.courses.find(c => c.id === courseId)?.name, [courseId, data?.courses])

    // Filtered courses based on the search value
    const filteredCourses = useMemo(() => {
        if (!data?.courses) return [];
        if (!searchVal.trim()) return data.courses;

        // Filter courses based on course name
        return data.courses.filter(course =>
            course.name.toLowerCase().includes(searchVal.toLowerCase())
        );
    }, [data?.courses, searchVal]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={loading}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex gap-2 bg-background hover:bg-background justify-between text-inherit hover:text-primary hover:border-primary"
                >
                    {selectedCourseName
                        ? `${selectedCourseName}`
                        : "Select course..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4" avoidCollisions>
                <Command label="Select Course" shouldFilter={false} loop={true} >
                    <CommandInput
                        value={searchVal}
                        onValueChange={(val) => setSearchVal(val)}
                        placeholder="Search courses..."
                    />
                    <CommandEmpty>No courses found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="max-h-60">
                            {isLoading ? (
                                <div className="grid place-content-center">
                                    <Spinner></Spinner>
                                </div>
                            ) : isError ? (
                                <>Error!</>
                            ) : filteredCourses.map((course) => (
                                <CommandItem
                                    key={course.id}
                                    value={course.id}
                                    onSelect={(currentValue) => {
                                        setCourseId(currentValue)
                                        setOpen(false)
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

export default SingleSelectCourse

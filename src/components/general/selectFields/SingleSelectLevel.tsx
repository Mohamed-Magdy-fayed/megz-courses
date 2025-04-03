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
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import Spinner from "@/components/ui/Spinner"
import { Typography } from "@/components/ui/Typoghraphy"

type SingleSelectProps = {
    loading: boolean;
    courseId: string;
    levelId: string;
    setLevelId: Dispatch<SetStateAction<string>>;
}

export default function SingleSelectLevel({ courseId, levelId, setLevelId, loading }: SingleSelectProps) {
    const { data, isLoading, isError, error } = api.levels.getByCourseId.useQuery({ courseId }, { enabled: !!courseId })

    const [open, setOpen] = useState(false)
    const [searchVal, setSearchVal] = useState("")

    const selectedLevelName = useMemo(() => data?.levels.find(c => c.id === levelId)?.name, [levelId, data?.levels])

    // Filtered levels based on the search value
    const filteredLevels = useMemo(() => {
        if (!data?.levels) return [];
        if (!searchVal.trim()) return data.levels;

        // Filter levels based on level name
        return data.levels.filter(level =>
            level.name.toLowerCase().includes(searchVal.toLowerCase())
        );
    }, [data?.levels, searchVal]);

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
                    {selectedLevelName
                        ? `${selectedLevelName}`
                        : "Select level..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 mx-4">
                <Command label="Select Level" shouldFilter={false} loop={true} >
                    <CommandInput
                        value={searchVal}
                        onValueChange={(val) => setSearchVal(val)}
                        placeholder="Search levels..."
                    />
                    <CommandEmpty>No levels found.</CommandEmpty>
                    <CommandGroup>
                        {!courseId ? (
                            <Typography className="text-destructive">Please select course first</Typography>
                        ) : (
                            <ScrollArea>
                                {isError ? (
                                    <>Error: {error}</>
                                ) : isLoading ? (
                                    <div className="grid place-content-center">
                                        <Spinner />
                                    </div>
                                ) : filteredLevels.map((level) => (
                                    <CommandItem
                                        key={level.id}
                                        value={level.id}
                                        onSelect={(currentValue) => {
                                            setLevelId(currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                courseId === level.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {level.name}
                                    </CommandItem>
                                ))}
                            </ScrollArea>
                        )}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

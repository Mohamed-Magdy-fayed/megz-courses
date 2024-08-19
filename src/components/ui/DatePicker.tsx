import { ButtonHTMLAttributes, Dispatch, FC, SetStateAction, useRef } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import Calendar from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Label } from "./label"
import { cn } from "@/lib/utils"
import { TimePicker } from "./TimePicker"

interface DatePickerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    date: Date | undefined
    setDate: Dispatch<SetStateAction<Date | undefined>>
}

export const DatePicker: FC<DatePickerProps> = ({ date, setDate, className, ...props }) => {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    customeColor={"foregroundOutlined"}
                    className={cn('flex flex-wrap items-center h-fit gap-2 justify-start hover:bg-slate-50 hover:text-primary hover:border-primary', className)}
                    {...props}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPPp") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                collisionPadding={{ bottom: 30 }}
                className="flex w-auto flex-col space-y-2 p-2 bg-background translate-y-20"
            >
                <div className="rounded-md border">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </div>
                <Label htmlFor="hours" className="text-xs">
                    Group Time
                </Label>
                <div className="flex gap-2 items-center">
                    <TimePicker
                        date={date}
                        setDate={setDate}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}

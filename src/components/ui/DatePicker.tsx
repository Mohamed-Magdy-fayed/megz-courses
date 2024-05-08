import { Dispatch, FC, SetStateAction } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import Calendar from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

type DatePickerProps = {
    date: Date | undefined
    setDate: Dispatch<SetStateAction<Date | undefined>>
}

export const DatePicker: FC<DatePickerProps> = ({ date, setDate }) => {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    customeColor={"foregroundOutlined"}
                    className='max-w-[16rem] flex flex-wrap items-center h-fit gap-2 justify-start hover:bg-primary-foreground hover:text-primary hover:border-primary'
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="flex w-auto flex-col space-y-2 p-2"
            >
                <div className="rounded-md border">
                    <Calendar mode="single" selected={date} onSelect={setDate} />
                </div>
            </PopoverContent>
        </Popover>
    )
}

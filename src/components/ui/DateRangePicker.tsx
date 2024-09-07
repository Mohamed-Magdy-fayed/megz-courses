import { ButtonHTMLAttributes, Dispatch, FC, SetStateAction, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { DateRange, DayPicker } from "react-day-picker"
import { format } from "date-fns"

interface DateRangePickerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    startDate: Date | undefined
    endDate: Date | undefined
    setStartDate: Dispatch<SetStateAction<Date | undefined>>
    setEndDate: Dispatch<SetStateAction<Date | undefined>>
    handleChange: () => void
    handleReset: () => void
}

export const DateRangePicker: FC<DateRangePickerProps> = ({
    label,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleChange,
    handleReset,
    className,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div>
            <Button
                variant="outline"
                customeColor={"foregroundOutlined"}
                onClick={() => setIsOpen(true)}
                className={cn('max-w-sm flex border border-transparent hover:border-muted text-muted p-1 items-center h-fit gap-2 justify-start focus-visible:ring-0 focus-visible:ring-offset-0', isOpen ? "border-primary" : "", className)}
                {...props}
            >
                {label}
                <CalendarIcon className="h-4 w-4" />
            </Button>
            <Modal
                title="Pick a Range"
                description={`From ${startDate ? format(startDate, "dd/MMM/yy") : "start date"} To ${endDate ? format(endDate, "dd/MMM/yy") : "end date"}`}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <DayPicker
                    showOutsideDays={true}
                    mode="range"
                    selected={{ from: startDate, to: endDate }}
                    // @ts-ignore
                    onSelect={(range: DateRange | undefined) => {
                        setStartDate(range?.from)
                        setEndDate(range?.to)
                    }}
                    className={cn("p-3", className)}
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                            buttonVariants({ variant: "outline", customeColor: "foregroundOutlined" }),
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-50 hover:text-primary hover:border-primary"
                        ),
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell:
                            "text-primary rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary-foreground/50 [&:has([aria-selected])]:bg-primary-foreground first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                            buttonVariants({ variant: "outline", customeColor: "foregroundOutlined" }),
                            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-50 hover:text-primary hover:border-primary"
                        ),
                        day_range_end: "day-range-end",
                        day_selected:
                            "!bg-primary !text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-primary-foreground text-foreground",
                        day_outside:
                            "day-outside text-primary opacity-50 aria-selected:bg-primary/50 aria-selected:text-primary aria-selected:opacity-30",
                        day_disabled: "text-primary opacity-50",
                        day_range_middle:
                            "aria-selected:bg-primary-foreground aria-selected:text-foreground",
                        day_hidden: "invisible",
                    }}
                    components={{
                        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                    }}
                    {...props}
                />
                <div className="flex items-center justify-end gap-4 my-2">
                    <Button onClick={() => {
                        handleReset()
                        setIsOpen(false)
                    }} customeColor={"destructive"}>Reset</Button>
                    <Button onClick={() => {
                        handleChange()
                        setIsOpen(false)
                    }} customeColor={"success"}>Confirm</Button>
                </div>
            </Modal>
        </div>
    )
}

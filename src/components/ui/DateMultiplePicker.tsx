import { ButtonHTMLAttributes, FC } from "react"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DayPicker } from "react-day-picker"
import { ZoomSession } from "@prisma/client"

interface DateMultiplePickerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    maxDays: number;
    hours: number;
    minutes: number;
    trainerSessions: Date[];
    zoomClients: ({ zoomSessions: ZoomSession[] })[];
    days: Date[];
    setDays: (dates: Date[]) => void;
}

export const DateMultiplePicker: FC<DateMultiplePickerProps> = ({
    maxDays,
    days,
    hours,
    minutes,
    trainerSessions,
    zoomClients,
    setDays,
    className,
    ...props
}) => {
    return (
        <DayPicker
            showOutsideDays={true}
            mode="multiple"
            selected={days}
            // @ts-ignore
            onSelect={(selectedDays) => {
                if (selectedDays) {
                    setDays(selectedDays.map(d => new Date(d.setHours(hours, minutes, 0, 0))))
                }
            }}
            disabled={(day) => {
                // Disable all days if the number of selected days exceeds the limit
                if (days.length >= maxDays) {
                    return !days.some((selectedDay) =>
                        selectedDay.toDateString() === day.toDateString()
                    );
                }

                // Disable days if the trainer has sessions on the exact date and time
                const trainerHasSession = trainerSessions.some((session) => {
                    const sessionStart = new Date(session); // Start time of the session
                    const sessionEnd = new Date(sessionStart.getTime() + 2 * 60 * 60 * 1000); // End time (2 hours later)

                    const selectedTime = new Date(day); // Selected day and time
                    selectedTime.setHours(hours, minutes, 0, 0); // Set the selected time

                    // Check if the selected time is within the session's time range
                    return selectedTime >= sessionStart && selectedTime <= sessionEnd;
                });

                if (trainerHasSession) {
                    return true;
                }

                // Disable days if no Zoom clients are available on the selected date and time
                const noZoomClientsAvailable = zoomClients.every((client) => {
                    return client.zoomSessions.some(session => {
                        const sessionStart = new Date(session.sessionDate); // Start time of the session
                        const sessionEnd = new Date(sessionStart.getTime() + 2 * 60 * 60 * 1000); // End time (2 hours later)

                        const selectedTime = new Date(day); // Selected day and time
                        selectedTime.setHours(hours, minutes, 0, 0); // Set the selected time

                        // Check if the selected time is within the session's time range
                        return selectedTime >= sessionStart && selectedTime <= sessionEnd;
                    })
                });

                if (noZoomClientsAvailable) {
                    return true;
                }

                // Otherwise, no days are disabled
                return false;
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
                day_today: "border-primary",
                day_outside:
                    "day-outside text-primary opacity-50 aria-selected:bg-primary/50 aria-selected:text-primary aria-selected:opacity-30",
                day_disabled: "text-primary opacity-50",
                day_range_middle:
                    "aria-selected:bg-primary-foreground aria-selected:text-foreground",
                day_hidden: "invisible",
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
            {...props}
        />
    )
}

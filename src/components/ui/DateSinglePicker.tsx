import { ButtonHTMLAttributes, FC } from "react"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DayPicker } from "react-day-picker"
import { ZoomClient, ZoomSession } from "@prisma/client"

interface DateSinglePickerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    hours: number;
    minutes: number;
    trainerSessions: Date[];
    zoomClients: { zoomSessions: ZoomSession[] }[];
    date: Date | undefined;
    setDate: (dates: Date | undefined) => void;
    isTest?: boolean
}

export const DateSinglePicker: FC<DateSinglePickerProps> = ({
    date,
    setDate,
    hours,
    minutes,
    trainerSessions,
    zoomClients,
    className,
    isTest,
    ...props
}) => {
    return (
        <DayPicker
            showOutsideDays={true}
            mode="single"
            selected={date}
            // @ts-ignore
            onSelect={(newDate) => {
                if (newDate) {
                    const adjustedDate = new Date(newDate);
                    adjustedDate.setHours(hours, minutes, 0, 0);
                    setDate(adjustedDate);
                } else {
                    setDate(undefined);
                }
            }}
            disabled={(day) => {
                // Set selected time range
                const selectedTime = new Date(day);
                selectedTime.setHours(hours, minutes, 0, 0);

                const selectedTimeEnd = new Date(selectedTime);
                selectedTimeEnd.setMinutes(selectedTimeEnd.getMinutes() + (isTest ? 30 : 120)); // 30 min if test, otherwise 2 hours

                // Disable days if the trainer has sessions that intersect with the selected time
                const trainerHasSession = trainerSessions.some((session) => {
                    const sessionStart = new Date(session);
                    const sessionEnd = new Date(sessionStart);
                    sessionEnd.setMinutes(sessionStart.getMinutes() + (isTest ? 30 : 120));

                    // Check if the selected time or its end time overlaps with a trainer's session
                    return (
                        (selectedTime >= sessionStart && selectedTime < sessionEnd) || // Selected time starts inside a session
                        (selectedTimeEnd > sessionStart && selectedTimeEnd <= sessionEnd) || // Selected time ends inside a session
                        (selectedTime <= sessionStart && selectedTimeEnd >= sessionEnd) // Selected time fully overlaps the session
                    );
                });

                if (trainerHasSession) {
                    return true;
                }

                // Disable days if no Zoom clients are available within the selected time
                const noZoomClientsAvailable = zoomClients.every(client =>
                    client.zoomSessions.some(session => {
                        const sessionStart = new Date(session.sessionDate);
                        const sessionEnd = new Date(sessionStart);
                        sessionEnd.setMinutes(sessionStart.getMinutes() + (isTest ? 30 : 120));

                        // Check if the selected time overlaps with Zoom session
                        return (
                            (selectedTime > sessionStart && selectedTime < sessionEnd) ||
                            (selectedTimeEnd > sessionStart && selectedTimeEnd < sessionEnd) ||
                            (selectedTime <= sessionStart && selectedTimeEnd >= sessionEnd)
                        );
                    })
                );

                if (noZoomClientsAvailable) {
                    return true;
                }

                // Otherwise, the day is selectable
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
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary-foreground hover:text-primary hover:border-primary"
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

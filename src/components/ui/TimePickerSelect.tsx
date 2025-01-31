"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

interface TimePickerSelectProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
}

export function TimePickerSelect({ date, setDate }: TimePickerSelectProps) {
    // Function to generate time options
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = new Date(0, 0, 0, hour, minute).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
                times.push(timeString);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    return (
        <Select
            value={date?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })}
            onValueChange={(value) => {
                const [time, period] = value.split(" ");
                if (!time) return
                let [hours, minutes] = time.split(":").map(Number);
                if (!hours) return

                // Convert to 24-hour format
                if (period === "PM" && hours !== 12) {
                    hours += 12;
                }
                if (period === "AM" && hours === 12) {
                    hours = 0;
                }

                const newDate = new Date();
                newDate.setHours(hours, minutes, 0, 0);
                setDate(newDate);
            }}
        >
            <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
                {timeOptions.map((time, index) => (
                    <SelectItem key={index} value={time}>
                        {time}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
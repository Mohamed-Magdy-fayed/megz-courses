import { cn } from "@/lib/utils";
import { FC, useEffect, useState } from "react";
import { Typography } from "../ui/Typoghraphy";

interface CounterProps {
    state: {
        style: string;
        textColor: string;
        target: number;
    }
}

const Counter: FC<CounterProps> = ({ state: {
    style,
    textColor,
    target,
} }) => {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const ticker = setInterval(() => {
            setCurrent(prev => {
                if (prev > target) {
                    clearInterval(ticker)
                    return target
                }
                return target / 1000 > 1 ? prev + 1000 : prev + 10
            })
        }, 20)
        return () => clearInterval(ticker)
    }, [target])

    return (
        <Typography variant="bodyText" className={cn("!text-3xl font-bold", textColor)}>
            {current > 1000 ? new Intl.NumberFormat("en-US", { style, currency: "EGP", maximumFractionDigits: 2 }).format(current / 1000) : new Intl.NumberFormat("en-US", { style: style === "currency" ? "currency" : style === "percent" ? "percent" : undefined, currency: "EGP", maximumFractionDigits: 2 }).format(current)}
            {current > 1000 && "K"}
        </Typography>
    )
}

export default Counter

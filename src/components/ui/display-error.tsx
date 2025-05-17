'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

type DisplayErrorProps = {
    title?: string
    message: string
    center?: boolean
}

export function DisplayError({ title = "An error occured", message, center = true }: DisplayErrorProps) {
    return (
        <div
            className={`w-full h-full p-4 ${center ? "grid place-content-center text-center" : ""}`}
        >
            <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </div>
    )
}

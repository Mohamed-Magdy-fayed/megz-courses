import { HTMLAttributes, useEffect, useState, } from "react"
import Spinner from "../Spinner"
import { Card } from "../ui/card"
import { cn } from "@/lib/utils"

const FormIfram = ({ src, className, ...rest }: HTMLAttributes<HTMLDivElement> & { src: string | undefined }) => {
    const [screenH, setScreenH] = useState(0)

    useEffect(() => {
        setScreenH(window.innerHeight - 150)
        window.addEventListener("resize", () => setScreenH(window.innerHeight - 150))
        return () => window.removeEventListener("resize", () => setScreenH(window.innerHeight - 150))
    }, [])

    if (!src) return (
        <div className="w-full h-full grid place-content-center">
            <Spinner />
        </div>
    )

    return (
        <Card {...rest} className={cn("w-full max-w-2xl", className)}>
            <iframe
                className="w-full max-w-2xl"
                src={src}
                height={screenH}
            >
                <Spinner></Spinner>
            </iframe>
        </Card>
    )
}

export default FormIfram
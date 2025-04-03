import { FC, ReactNode } from "react"
import { Typography } from "@/components/ui/Typoghraphy"
import { cn } from "@/lib/utils"

interface LandingSectionSeparatorProps {
    images: string
    title: string
    subTitle: string
    titleIcons: ReactNode
}

const LandingSectionSeparator: FC<LandingSectionSeparatorProps> = ({ images, subTitle, title, titleIcons }) => {
    return (
        <div>
            <div className="relative isolate lg:my-8 mb-4 md:mb-8">
                <div className="after:content after:absolute text-center after:inset-0 after:bg-primary after:h-[2px] after:rounded-md after:translate-y-3 after:-z-10" >
                    <Typography className="bg-background px-4 text-xl leading-tight font-medium tracking-wide">
                        {subTitle}
                    </Typography>
                </div>
            </div>
            <div>
                <div className={cn(`relative bg-cover bg-center w-full h-40 bg-fixed`, images)}>
                    <div className="grid place-content-center absolute inset-0 bg-accent/50">
                        <Typography
                            variant={"primary"}
                            className="text-accent-foreground flex items-center gap-4"
                        >
                            {titleIcons}
                            {title}
                            {titleIcons}
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingSectionSeparator
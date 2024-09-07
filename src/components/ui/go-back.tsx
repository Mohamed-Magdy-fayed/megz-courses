import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowLeftFromLine } from 'lucide-react'
import { useRouter } from 'next/router'

const GoBackButton = () => {
    const router = useRouter()

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant={"icon"} customeColor={"primaryIcon"} onClick={() => router.back()}>
                    <ArrowLeftFromLine></ArrowLeftFromLine>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                Go Back
            </TooltipContent>
        </Tooltip>
    )
}

export default GoBackButton
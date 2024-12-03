import { Typography } from '@/components/ui/Typoghraphy'
import { CogIcon } from 'lucide-react'

export default function CommingSoon() {
    return (
        <div className='w-full h-[50vh] grid place-content-center place-items-center'>
            <Typography variant={"primary"} >Coming Soon!</Typography>
            <CogIcon className='animate-spin' size={96} />
        </div>
    )
}

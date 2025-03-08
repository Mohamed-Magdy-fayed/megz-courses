import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function UserAvatar({ src }: { src: string; }) {
    return (
        <Avatar className='h-4 w-4'>
            <AvatarImage src={src} />
            <AvatarFallback />
        </Avatar>
    )
}

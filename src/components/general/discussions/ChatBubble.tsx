import UserAvatar from '@/components/ui/user/UserAvatar';
import { cn } from '@/lib/utils';

export default function ChatBubble ({ message, isOwn, avatar }: { message: any; isOwn: boolean; avatar?: string }) {
    return (
    <div className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
        {!isOwn && <UserAvatar src={avatar || ""} />}
        <div className={cn(
            "rounded-2xl px-4 py-2 max-w-[75vw] text-sm",
            isOwn ? "bg-primary text-primary-foreground ml-auto" : "bg-info text-info-foreground mr-auto"
        )}>
            {message.content}
            <div className="text-xs text-info-foreground mt-1 text-right">{new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        {isOwn && <UserAvatar src={avatar || ""} />}
    </div>
)
};

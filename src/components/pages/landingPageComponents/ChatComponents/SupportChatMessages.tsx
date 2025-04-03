import { cn } from "@/lib/utils";
import { ChatAgent, Message, SupportChat, User } from "@prisma/client";
import { FC, useEffect, useRef } from "react";
import { Typography } from "@/components/ui/Typoghraphy";
import { useSession } from "next-auth/react";

type SupportChatMessagesProps = {
    messages: Message[]
    myChatData?: {
        chat: (SupportChat & {
            messages: Message[];
            user: User | null;
            agent: (ChatAgent & {
                user: User;
            }) | null;
        }) | null;
    }
    isChatAgentView?: boolean
}

const SupportChatMessages: FC<SupportChatMessagesProps> = ({ messages, myChatData, isChatAgentView }) => {
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const { data: sesstionData } = useSession()

    const scrollToLastMessage = () => {
        if (lastMessageRef.current) {
            const newMessage = lastMessageRef.current.lastChild as HTMLElement;
            if (newMessage) {
                setTimeout(() => {
                    newMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
            }
        }
    }

    useEffect(() => {
        scrollToLastMessage()
    }, [messages, open])
    useEffect(() => {
        scrollToLastMessage()
    }, [])

    return (
        <div className="flex flex-col" ref={lastMessageRef}>
            {isChatAgentView
                ? myChatData?.chat && messages.map((msg, i) => (
                    <div key={msg.id} className={cn("flex flex-col self-start", msg.sender !== myChatData?.chat?.user?.name && "self-end")}>
                        {msg.sender !== myChatData.chat?.messages[i - 1]?.sender && (
                            <Typography className='text-sm text-foreground mt-1'>{msg.sender}</Typography>
                        )}
                        <div className={cn('w-fit self-end bg-primary text-primary-foreground px-2 rounded-md mb-1', msg.sender === myChatData?.chat?.user?.name && "bg-muted text-muted-foreground self-start")}>
                            <Typography>{msg.text}</Typography>
                        </div>
                    </div>
                ))
                : myChatData?.chat ? messages.map((msg, i) => (
                    <div key={msg.id} className={cn("flex flex-col", msg.sender === sesstionData?.user.name && "self-end")}>
                        {msg.sender !== myChatData.chat?.messages[i - 1]?.sender && (
                            <Typography className='text-sm text-foreground mt-1'>{msg.sender}</Typography>
                        )}
                        <div className={cn('w-fit self-end bg-primary text-primary-foreground px-2 rounded-md mb-1', msg.sender !== sesstionData?.user.name && "bg-muted text-muted-foreground self-start")}>
                            <Typography>{msg.text}</Typography>
                        </div>
                    </div>
                )) : (
                    <div className={cn("flex flex-col self-start")}>
                        <Typography className='text-sm text-foreground mt-1'>System</Typography>
                        <div className={cn("px-2 rounded-md mb-1 bg-muted text-muted-foreground")}>
                            <Typography>Hello, how can we help you?</Typography>
                        </div>
                        {messages.map(msg => (
                            <div key={msg.id} className={cn("flex flex-col", msg.sender === sesstionData?.user.name && "self-end")}>
                                <Typography className='text-sm text-foreground mt-1'>{msg.sender}</Typography>
                                <div className={cn('bg-primary text-primary-foreground px-2 rounded-md mb-1')}>
                                    <Typography>{msg.text}</Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}

export default SupportChatMessages
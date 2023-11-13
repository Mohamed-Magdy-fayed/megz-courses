import { SeverityPill } from "@/components/overview/SeverityPill"
import { Typography } from "@/components/ui/Typoghraphy"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Headphones } from "lucide-react"
import ChatForm from "./ChatForm"
import SupportChatMessages from "./SupportChatMessages"
import { Dispatch, FC, SetStateAction } from "react"
import { ChatAgent, Message, SupportChat, User } from "@prisma/client"
import { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from "@tanstack/react-query"
import Spinner from "@/components/Spinner"
import { ScrollArea } from "@/components/ui/scroll-area"

type ChatPopoverProps = {
    isLoading: boolean
    open: boolean
    unreadMessages: Message[]
    messages: Message[]
    onOpenChange: (val: boolean) => void
    myChatData: {
        chat: (SupportChat & {
            messages: Message[];
            user: User | null;
            agent: (ChatAgent & {
                user: User;
            }) | null;
        }) | null;
    } | undefined
    refetchMyChat: <TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) => Promise<QueryObserverResult<{
        chat: (SupportChat & {
            user: User | null;
            agent: (ChatAgent & {
                user: User;
            }) | null;
            messages: Message[];
        }) | null;
    }>>
    setMessages: Dispatch<SetStateAction<Message[]>>
}

const ChatPopover: FC<ChatPopoverProps> = ({ onOpenChange, isLoading, open, messages, unreadMessages, myChatData, refetchMyChat, setMessages }) => {
    return (
        <Popover
            onOpenChange={onOpenChange}
            open={open}
        >
            <PopoverTrigger asChild>
                <button
                    className="group fixed bottom-4 left-0 flex gap-2 items-center bg-primary text-primary-foreground px-4 py-2 rounded-l-none rounded-r-full">
                    <Headphones className='w-4 h-4' />
                    <Typography className={cn('transition-all opacity-0 group-hover:opacity-100 pointer-events-none duration-200 group-hover:w-32 focus:w-32 w-0 whitespace-nowrap', open && "opacity-100 w-32")}>
                        Chat with us
                    </Typography>
                    {!open && unreadMessages.length > 0 && <SeverityPill color='destructive'>{unreadMessages.length}</SeverityPill>}
                </button>
            </PopoverTrigger>
            <PopoverContent className='ml-2 flex flex-col lg:h-[50vh] h-[40vh] p-4'>
                <ScrollArea className='flex-grow mb-2'>
                    {isLoading ? <Spinner className="w-full h-full p-20" /> : (
                        <SupportChatMessages myChatData={myChatData} messages={messages} />
                    )}
                </ScrollArea>
                <ChatForm onOpenChange={onOpenChange} myChatData={myChatData} refetchMyChat={refetchMyChat} setMessages={setMessages} />
            </PopoverContent>
        </Popover >
    )
}

export default ChatPopover
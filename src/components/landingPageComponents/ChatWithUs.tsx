import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useSession } from 'next-auth/react'
import { Message, SupportChat } from '@prisma/client'
import { pusherClient } from '@/lib/pusher'
import { Howl } from 'howler';
import { useToast } from '../ui/use-toast'
import ChatPopover from './ChatComponents/ChatPopover'
import { Channel } from 'pusher-js'

const ChatWithUs = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
    const [channelSubscription, setChannelSubscription] = useState<Channel>();

    const { toastInfo } = useToast()
    const { data: sessionData } = useSession()
    const { data: myChatData, refetch: refetchMyChat, isLoading } = api.chat.getMyChat.useQuery(undefined, { enabled: false })

    const onOpenChange = (val: boolean) => {
        setOpen(val)
        setUnreadMessages([])
    }

    const fetchData = async () => {
        try {
            const res = await refetchMyChat();
            if (!res.data?.chat) return;

            setMessages(res.data?.chat?.messages || []);
            return res.data.chat.id
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const channelSubscription = pusherClient.subscribe('SUPPORT_CHAT');
        setChannelSubscription(channelSubscription)
        const deleteSubscription = pusherClient.subscribe('DELETE_CHAT');
        const notificationSound = new Howl({
            src: ['/sounds/message-pop-alert.mp3'],
        });

        fetchData().then(id => {
            channelSubscription.bind(id!, (data: Message & { supportChat: SupportChat | null }) => {
                refetchMyChat().then((res) => {
                    setMessages(res.data?.chat?.messages || []);
                    if (data.sender === sessionData?.user.name) return setUnreadMessages([]);
                    notificationSound.play();
                    setUnreadMessages((prev) => (!open ? [...prev, data] : []));
                });
            });

            deleteSubscription.bind(id!, () => {
                refetchMyChat().then((res) => {
                    onOpenChange(false);
                    setMessages(res.data?.chat?.messages || []);
                    setUnreadMessages([]);
                    toastInfo('Chat has ended');
                });
            });
        });

        return () => {
            pusherClient.unsubscribe('SUPPORT_CHAT');
            pusherClient.unsubscribe('DELETE_CHAT');
            channelSubscription.unbind_all()
            deleteSubscription.unbind_all()
        };
    }, []);

    return (
        <ChatPopover
            onOpenChange={onOpenChange}
            open={open}
            messages={messages}
            unreadMessages={unreadMessages}
            myChatData={myChatData}
            refetchMyChat={refetchMyChat}
            setMessages={setMessages}
            isLoading={isLoading}
            channelSubscription={channelSubscription}
            setUnreadMessages={setUnreadMessages}
        />
    )
}

export default ChatWithUs
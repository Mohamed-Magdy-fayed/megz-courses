import SupportChatMessages from "@/components/landingPageComponents/ChatComponents/SupportChatMessages";
import AppLayout from "@/components/layout/AppLayout";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { pusherClient } from "@/lib/pusher";
import { Message, SupportChat } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Howl } from 'howler';
import ChatForm from "@/components/landingPageComponents/ChatComponents/ChatForm";
import ChatControls from "@/components/landingPageComponents/ChatComponents/ChatControles";

const ChatPage = () => {
    const router = useRouter()
    const id = router.query.chatId as string
    const [messages, setMessages] = useState<Message[]>([]);

    const { data: sesstionData } = useSession()
    const { data: myChatData, refetch: refetchMyChat } = api.chat.getChatById.useQuery({ id }, { enabled: false })

    const fetchData = async () => {
        try {
            refetchMyChat()
                .then(res => {
                    setMessages(res.data?.chat?.messages || [])
                })
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        if (!id) return
        fetchData();

        const channelSupscribtion = pusherClient.subscribe("SUPPORT_CHAT")
        const deleteSupscribtion = pusherClient.subscribe("DELETE_CHAT")
        const notificationSound = new Howl({
            src: ['/sounds/message-pop-alert.mp3'],
        });

        channelSupscribtion.bind(id, (data: Message & { supportChat: SupportChat | null; }) => {
            refetchMyChat()
                .then(res => {
                    setMessages(res.data?.chat?.messages || [])
                    if (data.sender === sesstionData?.user.name) return
                    notificationSound.play();
                })
        })
        deleteSupscribtion.bind(id, () => {
            router.push(`/chats`)
        })

        return () => {
            pusherClient.unsubscribe("SUPPORT_CHAT")
            pusherClient.unsubscribe("DELETE_CHAT")
            channelSupscribtion.unbind_all()
            deleteSupscribtion.unbind_all()
        }
    }, [id])

    return (
        <AppLayout>
            <ConceptTitle>Chat with {myChatData?.chat?.user?.name}</ConceptTitle>
            <ChatControls />
            <div className="flex flex-col p-4">
                <ScrollArea className='flex-grow mb-2 h-[calc(100vh-20rem)]'>
                    <SupportChatMessages myChatData={myChatData} messages={messages} isChatAgentView />
                </ScrollArea>
                <div className="">
                    <ChatForm myChatData={myChatData} refetchMyChat={refetchMyChat} setMessages={setMessages} />
                </div>
            </div>
        </AppLayout>
    )
}

export default ChatPage
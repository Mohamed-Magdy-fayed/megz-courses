import Spinner from "@/components/ui/Spinner"
import AppLayout from "@/components/pages/adminLayout/AppLayout"
import { SeverityPill } from "@/components/ui/SeverityPill"
import { PaperContainer } from "@/components/ui/PaperContainers"
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { getInitials } from "@/lib/getInitials"
import { ChatAgent, Message, SupportChat, User } from "@prisma/client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Howl } from "howler"
import { pusherClient } from "@/lib/pusher"

const ChatPage = () => {
    const chatsQuery = api.chat.getChats.useQuery(undefined, {
        enabled: false,
    })
    const [chats, setChats] = useState<(SupportChat & {
        user: User | null;
        messages: Message[]
        agent: (ChatAgent & {
            user: User;
        }) | null;
    })[]>([])

    const fetchData = async () => {
        try {
            chatsQuery.refetch()
                .then(res => {
                    setChats(res.data?.chats!);
                })
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData()

        const channelSupscribtion = pusherClient.subscribe("SUPPORT_CHAT")
        const deleteSupscribtion = pusherClient.subscribe("DELETE_CHAT")
        const createSupscribtion = pusherClient.subscribe("CREATE_CHAT")
        const notificationSound = new Howl({
            src: ['/sounds/message-pop-alert.mp3'],
        });

        channelSupscribtion.bind("ALL", (data: Message & {
            supportChat: (SupportChat & {
                user: User | null;
            }) | null;
        }) => {
            chatsQuery.refetch()
                .then(res => {
                    setChats(res.data?.chats!);
                    if (data.sender !== data?.supportChat?.user?.name) return
                    notificationSound.play();
                })
        })
        deleteSupscribtion.bind("ALL", () => {
            chatsQuery.refetch()
                .then(res => {
                    setChats(res.data?.chats!);
                })
        })
        createSupscribtion.bind("ALL", () => {
            chatsQuery.refetch()
                .then(res => {
                    setChats(res.data?.chats!);
                    notificationSound.play();
                })
        })

        return () => {
            pusherClient.unsubscribe("SUPPORT_CHAT")
            pusherClient.unsubscribe("DELETE_CHAT")
            pusherClient.unsubscribe("CREATE_CHAT")
            channelSupscribtion.unbind_all()
            deleteSupscribtion.unbind_all()
            createSupscribtion.unbind_all()
        }
    }, [])

    const getUnreadMessages = ({ messages, user }: SupportChat & {
        user: User | null;
        messages: Message[]
        agent: (ChatAgent & {
            user: User;
        }) | null;
    }) => {
        let unreadCount = 0
        for (let i = messages.length - 1; i > 0; i--) {
            const message = messages[i];
            if (message?.sender === user?.name) {
                unreadCount++
            } else {
                break
            }
        }
        return unreadCount
    }

    if (!chats) return (
        <div className="w-screen h-screen grid place-content-center">
            <Spinner />
        </div>
    )

    return (
        <AppLayout>
            <ConceptTitle>
                Chats
            </ConceptTitle>
            {chatsQuery.isLoading ? <Spinner className="w-full" /> :
                chats.length === 0 ? "No chats yet!" : (
                    <div>
                        {chats.map(chat => (
                            <Link key={chat.id} href={`/chats/${chat.id}`} className="">
                                <div className="flex items-center justify-between hover:bg-primary/5 p-2 lg:p-4">
                                    <div className="flex items-center gap-2" >
                                        <Avatar>
                                            <AvatarImage src={`${chat.user?.image}`} />
                                            <AvatarFallback>
                                                {getInitials(`${chat.user?.name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <Typography>
                                                {chat.user?.name}
                                            </Typography>
                                            <Typography variant={"secondary"} className="text-sm font-normal">
                                                {chat.user?.email}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 p-2 md:flex-row">
                                        {chat.messages[chat.messages.length - 1]?.sender === chat.user?.name &&
                                            <SeverityPill color="destructive" className="w-fit">
                                                {getUnreadMessages(chat)}
                                            </SeverityPill>
                                        }
                                        <div className="flex flex-col gap-2">
                                            <Typography>
                                                {chat.messages[chat.messages.length - 1]?.text}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                            </Link>
                        ))}
                    </div>
                )}
        </AppLayout>
    )
}

export default ChatPage
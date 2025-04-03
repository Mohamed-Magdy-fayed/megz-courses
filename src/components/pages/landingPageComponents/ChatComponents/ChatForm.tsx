import { Typography } from '@/components/ui/Typoghraphy';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { SupportChat, ChatAgent, User, Message } from '@prisma/client';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Channel } from 'pusher-js';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    message: z.string().min(1, "message can't be empty"),
});

type ChatFormValues = z.infer<typeof formSchema>;
type ChatFormProps = {
    setMessages: Dispatch<SetStateAction<Message[]>>
    onOpenChange?: (val: boolean) => void
    myChatData: {
        chat: (SupportChat & {
            user: User | null;
            agent: (ChatAgent & {
                user: User;
            }) | null;
            messages: Message[];
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
    channelSubscription?: Channel
    setUnreadMessages?: Dispatch<SetStateAction<Message[]>>
}

const ChatForm: FC<ChatFormProps> = ({ setMessages, channelSubscription, setUnreadMessages, myChatData, refetchMyChat, onOpenChange }) => {
    const defaultValues: z.infer<typeof formSchema> = {
        message: "",
    };

    const form = useForm<ChatFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const { toastError, toastSuccess } = useToast()
    const { data: sesstionData } = useSession()
    const createChatMutation = api.chat.createChat.useMutation()
    const sendMessageMutation = api.chat.sendMessage.useMutation()
    const deleteMyChatMutation = api.chat.deleteMyChat.useMutation()
    const deleteChatMutation = api.chat.deleteChat.useMutation()
    const trpcUtils = api.useUtils()

    const [loading, setLoading] = useState(false);

    const onSubmit = (data: ChatFormValues) => {
        setMessages(prev => [...prev, {
            id: "mockid",
            sender: sesstionData?.user.name || "you",
            text: data.message,
            createdAt: new Date(),
            supportChatId: "mockchatid",
            updatedAt: new Date()
        }])
        form.reset()

        const notificationSound = new Howl({
            src: ['/sounds/message-pop-alert.mp3'],
        });

        if (!myChatData?.chat) {
            createChatMutation.mutate({ message: data.message }, {
                onSuccess() {
                    refetchMyChat()
                        .then(res => {
                            setMessages(res.data?.chat?.messages || [])
                            channelSubscription?.bind(res.data?.chat?.id!, (data: Message & { supportChat: SupportChat | null }) => {
                                refetchMyChat().then((res) => {
                                    setMessages(res.data?.chat?.messages || []);
                                    if (data.sender === sesstionData?.user.name) return setUnreadMessages!([]);
                                    notificationSound.play();
                                    setUnreadMessages!((prev) => (!open ? [...prev, data] : []));
                                });
                            });
                        })
                },
                onError(e) {
                    toastError(e.message)
                },
            })
        }
        if (!myChatData?.chat) return
        sendMessageMutation.mutate({ id: myChatData?.chat?.id, message: data.message }, {
            onSuccess() {
                refetchMyChat()
                    .then(res => {
                        setMessages(res.data?.chat?.messages || [])
                    })
            },
            onError(e) {
                toastError(e.message)
            },
        })
    };

    const handleEndChat = () => {
        setLoading(true)
        if (!onOpenChange) {
            if (!myChatData?.chat?.id) return setLoading(false)
            deleteChatMutation.mutate({ id: myChatData?.chat?.id }, {
                onSuccess() {
                    trpcUtils.chat.getChatById.invalidate().then(() => {
                        setLoading(false)
                    })
                },
                onError(e) {
                    toastError(e.message)
                    setLoading(false)
                },
            })
            return
        }
        deleteMyChatMutation.mutate(undefined, {
            onSuccess() {
                trpcUtils.chat.getMyChat.invalidate().then(() => {
                    setLoading(false)
                    onOpenChange(false)
                })
            },
            onError(e) {
                toastError(e.message)
                setLoading(false)
            },
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-2"
            >
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    disabled={loading}
                                    placeholder="How can we help?"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button disabled={loading} type="submit" className='float-right'>
                    <Typography>Submit</Typography>
                </Button>
                {myChatData?.chat && (
                    <Button customeColor={"destructiveIcon"} onClick={handleEndChat} disabled={loading} type="button">
                        <Typography>End Chat</Typography>
                    </Button>
                )}
            </form>
        </Form>
    )
}

export default ChatForm
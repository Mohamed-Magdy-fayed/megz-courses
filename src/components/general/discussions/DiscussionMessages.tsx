import { useSession } from 'next-auth/react'
import { UIEvent, useEffect, useRef, useState } from 'react';
import ChatBubble from '@/components/general/discussions/ChatBubble';
import { useDiscussionMessages } from '@/hooks/useDiscussionMessages';
import Spinner from '@/components/ui/Spinner';
import { DisplayError } from '@/components/ui/display-error';

export default function DiscussionMessages({ discussionId }: { discussionId?: string }) {
    const { data: sessionData } = useSession();
    const [stopScroll, setStopScroll] = useState(false);
    const { messages, isLoading, isError, fetchNext, hasMore, isFetchingMore } = useDiscussionMessages(discussionId);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Handler to detect scroll near top for infinite scroll up
    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;

        if (!hasMore || isFetchingMore) return;
        // If user scrolls near the top (within 64px)
        if (el.scrollTop < 64) {
            fetchNext();
        }
    };

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stopScroll) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setStopScroll(true);
        setTimeout(() => {
            setStopScroll(false);
        }, 5000);
    }, [isFetchingMore]);

    if (isLoading) return <Spinner className="w-full h-20" />;
    if (isError) return <DisplayError message="Failed to load messages" />;

    return (
        <div ref={scrollRef} className="flex-1 overflow-auto bg-background px-2 py-4 space-y-2" onScroll={handleScroll}>
            {messages.length === 0 && (
                <div className="text-center mt-10">No messages yet. Say hello!</div>
            )}
            {isFetchingMore && <Spinner className="w-full h-20" />}
            {messages.toReversed().map((msg: any) => (
                <ChatBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === sessionData?.user.id}
                    avatar={msg.sender?.image}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    )
}

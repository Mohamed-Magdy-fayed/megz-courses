import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";

export default function DiscussionMessageForm({discussionId}: {discussionId?: string}) {
    const { register, handleSubmit, reset } = useForm<{ content: string }>();
    
    const trpcUtils = api.useUtils();
    const sendMutation = api.discussions.sendMessage.useMutation();

    const onSend = async (values: { content: string }) => {
        if (!values.content.trim() || !discussionId) return;
        await sendMutation.mutateAsync({
            discussionId,
            content: values.content,
        });
        reset();
        trpcUtils.discussions.invalidate();
    };

    return (
        <form
            onSubmit={handleSubmit(onSend)}
            className="flex items-center gap-2 px-3 py-2 border-t bg-card sticky bottom-0"
        >
            <Input
                {...register("content")}
                placeholder="Type a message..."
                autoComplete="off"
                disabled={!discussionId}
            />
            <Button type="submit" disabled={sendMutation.isLoading} variant="icon" customeColor="primaryIcon">
                <SendIcon size={20} />
            </Button>
        </form>
    )
}

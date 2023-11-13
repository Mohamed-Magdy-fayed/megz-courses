import { ArrowLeftToLine } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ChatControls = () => {
    return (
        <div className="flex items-center mb-4">
            <Link href={`/chats`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button customeColor={"mutedIcon"} variant={"icon"}>
                            <ArrowLeftToLine />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        go to chats
                    </TooltipContent>
                </Tooltip>
            </Link>
        </div>
    );
};

export default ChatControls;

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/Typoghraphy";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const ToggleSection = ({ title, primaryColor, defaultIsOpen, children }: { title: string, primaryColor?: boolean, defaultIsOpen?: boolean, children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(defaultIsOpen || false);

    return (
        <div>
            <div className="flex items-start space-x-2 group">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            variant={"icon"}
                            customeColor={"mutedIcon"}
                            className={cn(`!p-1 rounded-full !w-auto !h-auto`)}
                        >
                            <ChevronDown className={cn('w-4 h-4 group-hover:opacity-100 !m-0 -rotate-90 transition-all duration-300', isOpen && "opacity-0 -rotate-0")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isOpen ? "Collapse Heading" : "Expand Heading"}
                    </TooltipContent>
                </Tooltip>

                <div>
                    <Typography variant={"secondary"} className={cn(primaryColor && "text-primary")}>
                        {title}
                    </Typography>
                    <div
                        className="overflow-hidden mt-2"
                    >
                        <div className={cn("transition-all duration-300", isOpen ? "-mb-0" : "-mb-[100%]")}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TutorialPopoverProps {
  isopen: boolean;
  children: ReactNode;
  content: ReactNode;
}

const TutorialPopover: FC<TutorialPopoverProps> = ({
  isopen,
  children,
  content,
}) => {
  return (
    <Popover open={isopen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="bottom" className="fixed translate-y-4">
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default TutorialPopover;

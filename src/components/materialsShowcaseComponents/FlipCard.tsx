import { FC, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import Scrollbar from "../Scrollbar";
import { ScrollArea } from "../ui/scroll-area";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
}

const FlipCard: FC<FlipCardProps> = ({ back, front }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="z-0 flex select-none transition-all [perspective:1000px] hover:z-[1]">
      <div
        onClick={() => setFlipped(!flipped)}
        className={cn(
          "flex flex-1 cursor-pointer rounded-lg transition-all duration-700 ease-out [transform-style:preserve-3d]",
          flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        <div className="flex min-w-full flex-col items-center justify-between gap-4 rounded-lg bg-primary p-4 [backface-visibility:hidden]">
          {front}
        </div>
        <div className="flex min-w-full flex-col items-center justify-between gap-4 rounded-lg bg-secondary p-4 [backface-visibility:hidden] [transform:rotateY(180deg)_translate(100%,0)]">
          {back}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;

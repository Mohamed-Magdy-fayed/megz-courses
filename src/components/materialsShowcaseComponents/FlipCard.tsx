import { FC, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
}

const FlipCard: FC<FlipCardProps> = ({ back, front }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="select-none [perspective:1000px]">
      <div
        onClick={() => setFlipped(!flipped)}
        className={cn(
          "my-4 w-full cursor-pointer transition-all duration-700 ease-out [transform-style:preserve-3d]",
          flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        <div className="relative flex flex-col items-center gap-4 rounded-lg bg-primary p-4 text-white [transform:translateZ(1px)]">
          {front}
        </div>
        <div className="absolute right-0 top-0 flex h-full w-full flex-col items-center gap-4 rounded-lg bg-secondary p-4 text-white [transform:translateZ(-1px)_rotateY(180deg)]">
          {back}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;

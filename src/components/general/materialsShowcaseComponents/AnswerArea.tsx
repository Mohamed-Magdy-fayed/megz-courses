import { cn } from "@/lib/utils";
import { useDraggingStore } from "@/zustand/store";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AnswerAreaProps {
  isCard: boolean;
  answerAreaImage: string;
  children: ReactNode;
}
const AnswerArea = ({ isCard, answerAreaImage, children }: AnswerAreaProps) => {
  const { areas, removeSelection } = useDraggingStore();

  return (
    <div className={cn("relative grid", isCard ? "" : "bg-white text-black")}>
      {children}
      {areas.filter((area) => area.img === answerAreaImage)[0]?.card && (
        <Button
          onClick={() => {
            removeSelection(answerAreaImage);
          }}
          variant="x"
          className="absolute right-2 top-2"
        >
          X
        </Button>
      )}
    </div>
  );
};

export default AnswerArea;

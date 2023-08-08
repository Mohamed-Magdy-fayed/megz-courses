import { cn } from "@/lib/utils";
import { useDraggingStore } from "@/zustand/store";
import { ReactNode } from "react";
import { Button } from "../ui/button";

interface AnswerAreaProps {
  isCard: boolean;
  answerAreaId: string;
  children: ReactNode;
}
const AnswerArea = ({ isCard, answerAreaId, children }: AnswerAreaProps) => {
  const { areas, removeSelection } = useDraggingStore();

  return (
    <div className={cn("relative grid", isCard ? "" : "bg-white text-black")}>
      {children}
      {areas.filter((area) => area.id === answerAreaId)[0]?.card && (
        <Button
          onClick={() => {
            removeSelection(answerAreaId);
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

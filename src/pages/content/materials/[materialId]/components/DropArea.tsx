import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { useDraggingStore } from "@/zustand/store";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";

interface DropAreaProps {
  isCard: boolean;
  dropAreaId: string;
  children: ReactNode;
}
export default function DropArea({
  isCard,
  dropAreaId,
  children,
}: DropAreaProps) {
  const { areas, removeSelection } = useDraggingStore();

  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) return <Spinner />;

  return (
    <div className={cn("relative grid", isCard ? "" : "bg-white text-black")}>
      {children}
      {areas.filter((area) => area.id === dropAreaId)[0]?.card && (
        <Button
          onClick={() => {
            removeSelection(dropAreaId);
          }}
          variant="x"
          className="absolute right-2 top-2"
        >
          X
        </Button>
      )}
    </div>
  );
}

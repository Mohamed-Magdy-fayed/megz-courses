import { ReactNode } from "react";

interface ScrollbarProps {
  children: ReactNode;
}

export default function Scrollbar({ children }: ScrollbarProps) {
  return (
    <div
      className="overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary"
    >
      {children}
    </div>
  );
}

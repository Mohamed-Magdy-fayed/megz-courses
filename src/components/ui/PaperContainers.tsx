import { cn } from "@/lib/utils";
import { HTMLAttributes } from 'react'

interface PaperContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PaperContainer({ children, className, ...rest }: PaperContainerProps) {
  return (
    <div
      className={cn(`overflow-hidden rounded-2xl bg-background text-foreground shadow-lg p-4`, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

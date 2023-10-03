import { cn } from "@/lib/utils";
import { Paper, PaperProps } from "@mui/material";
import React from "react";

interface PaperContainerProps extends PaperProps {
  children: React.ReactNode;
}

export function PaperContainer({ children, className, ...rest }: PaperContainerProps) {
  return (
    <Paper
      elevation={0}
      className={cn(`overflow-hidden rounded-[20px] grid bg-white text-dark shadow-[rgba(0,_0,_0,_0.04)_0px_5px_22px,_rgba(0,_0,_0,_0.03)_0px_0px_0px_0.5px] transition-[box-shadow_300ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms]`, className)}
      {...rest}
    >
      {children}
    </Paper>
  );
}

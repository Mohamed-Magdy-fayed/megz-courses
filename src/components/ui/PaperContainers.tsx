import { Paper } from "@mui/material";
import React from "react";

interface PaperContainerProps {
  children: React.ReactNode;
}

export function PaperContainer({ children }: PaperContainerProps) {
  return (
    <Paper
      elevation={0}
      className={`overflow-hidden rounded-[20px] bg-white text-dark shadow-[rgba(0,_0,_0,_0.04)_0px_5px_22px,_rgba(0,_0,_0,_0.03)_0px_0px_0px_0.5px] transition-[box-shadow_300ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms]`}
    >
      {children}
    </Paper>
  );
}

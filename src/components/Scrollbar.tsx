import React, { ReactNode } from "react";
import { Box } from "@mui/material";

interface ScrollbarProps {
  children: ReactNode;
}

export default function Scrollbar({ children }: ScrollbarProps) {
  return (
    <Box
      component="div"
      className="overflow-x-scroll transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50 scrollbar-thumb-rounded-lg"
    >
      {children}
    </Box>
  );
}

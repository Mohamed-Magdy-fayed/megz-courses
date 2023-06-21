import React, { ReactNode } from "react";
import { Box } from "@mui/material";

interface ScrollbarProps {
  children: ReactNode;
}

export default function Scrollbar({ children }: ScrollbarProps) {
  return (
    <Box
      component="div"
      className="custom-scrollbar overflow-x-scroll"
      sx={{
        scrollbarColor: "black",
      }}
    >
      {children}
    </Box>
  );
}

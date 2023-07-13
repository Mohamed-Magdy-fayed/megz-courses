import { Typography } from "@mui/material";
import React from "react";

interface TypographyProps {
  children: React.ReactNode;
}

export function ConceptTitle({ children }: TypographyProps) {
  return (
    <Typography
      className={`m-0 font-["Plus_Jakarta_Sans",_sans-serif] text-2xl font-bold leading-5 md:text-3xl lg:text-4xl`}
    >
      {children}
    </Typography>
  );
}

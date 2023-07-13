import { Button } from "@mui/material";
import React from "react";

interface ButtonsProps {
  children: React.ReactNode;
}

export function TransparentButton({ children }: ButtonsProps) {
  return (
    <Button
      className={`relative m-0 inline-flex min-w-[64px] cursor-pointer select-none appearance-none items-center justify-center gap-2 rounded-xl border-0 border-current bg-transparent px-3 py-2 align-middle font-[Inter,_-apple-system,_BlinkMacSystemFont,_"Segoe_UI",_Helvetica,_Arial,_sans-serif,_"Apple_Color_Emoji",_"Segoe_UI_Emoji"] text-sm font-semibold normal-case leading-7 text-inherit outline-none transition-[background-color_250ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms,_box-shadow_250ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms,_border-color_250ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms,_color_250ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms]`}
    >
      {children}
    </Button>
  );
}

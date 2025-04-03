"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "./scroll-area";
import { DialogContentProps } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface AutomaticModalProps {
  trigger: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  className?: DialogContentProps["className"];
}

export default function AutomaticModal({
  trigger,
  title,
  description,
  children,
  className,
}: AutomaticModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("!w-fit !min-w-[30rem]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] py-1">{children}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

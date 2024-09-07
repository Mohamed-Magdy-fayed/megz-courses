"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "./scroll-area";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export default function Modal({
  description,
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="!w-fit !min-w-[30rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">{children}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

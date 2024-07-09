"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "./scroll-area";
import { DropdownMenuItem } from "./dropdown-menu";
import { DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";

interface ModalProps {
  title: string;
  description: string;
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children?: ReactNode;
  itemChildren?: ReactNode;
}

export default function ModalInDropdownMenu({
  description,
  disabled,
  isOpen,
  onClose,
  onOpen,
  title,
  children,
  itemChildren,
}: ModalProps) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogTrigger asChild disabled={disabled}>
        <DropdownMenuItem onClick={(e) => {
          e.preventDefault()
          onOpen()
        }}>
          {itemChildren}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <ScrollArea className="max-h-[70vh]">{children}</ScrollArea>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

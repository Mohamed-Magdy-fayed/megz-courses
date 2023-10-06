import { cn } from "@/lib/utils";
import { Loader, LucideProps } from "lucide-react";
import React from "react";

export default function Spinner({ className, ...rest }: LucideProps) {
  return (
    <Loader
      size={100}
      className={cn("animate-spin", className)}
      {...rest}
    />
  );
}

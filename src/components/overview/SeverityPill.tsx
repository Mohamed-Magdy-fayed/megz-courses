import { ReactNode } from "react";
import { Badge, BadgeProps } from "../ui/badge";
import { cn } from "@/lib/utils";

interface SeverityPillProps extends BadgeProps {
  color: "primary" | "secondary" | "destructive" | "info" | "success" | "background" | "foreground" | "muted";
  children: ReactNode;
}

export const SeverityPill = ({ color, className, children, ...rest }: SeverityPillProps) => {
  const tailwindClass = () => {
    switch (color) {
      case "background":
        return "text-foreground bg-background"
      case "foreground":
        return "text-background bg-foreground"
      case "destructive":
        return "text-destructive-foreground bg-destructive"
      case "info":
        return "text-info-foreground bg-info"
      case "primary":
        return "text-primary-foreground bg-primary"
      case "secondary":
        return "text-secondary-foreground bg-secondary"
      case "success":
        return "text-success-foreground bg-success"
      case "muted":
        return "text-muted-foreground bg-muted"
      default:
        return "text-primary-foreground bg-primary";
    }
  }

  return (
    <Badge
      variant="default"
      className={cn(`h-6 grid place-content-center whitespace-nowrap rounded-xl px-1 py-2 text-center text-xs uppercase ${tailwindClass()}`, className)}
      {...rest}
    >
      {children}
    </Badge>
  );
};

import * as React from "react";

import { cn } from "@/lib/utils";
import { CaseSensitive, CaseUpper } from "lucide-react";

export interface TableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const TableInput = React.forwardRef<HTMLInputElement, TableInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <label className="opacity-0 px-6 pointer-events-none">{props.placeholder}</label>
        <input
          type={"text"}
          autoComplete="off"
          className={cn(
            "absolute left-0 bottom-0 translate-y-1 w-full p-1 border-transparent border hover:border bg-transparent placeholder:text-muted rounded focus-visible:outline-none focus-visible:border-primary hover:border-muted",
            className
          )}
          ref={ref}
          {...props}
        />
        <CaseSensitive className="w-4 h-4 text-muted absolute right-2 top-0 translate-y-1 pointer-events-none" />
      </div>
    );
  }
);
TableInput.displayName = "TableInput";

export { TableInput };

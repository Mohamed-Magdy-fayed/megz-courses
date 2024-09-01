import * as React from "react";

import { cn } from "@/lib/utils";
import { CaseSensitive, CaseUpper } from "lucide-react";

export interface TableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const TableInput = React.forwardRef<HTMLInputElement, TableInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={"text"}
          autoComplete="off"
          className={cn(
            "border-0 bg-transparent placeholder:text-muted p-1 rounded-md focus-visible:outline-none focus-visible:border-primary border-muted",
            className
          )}
          ref={ref}
          {...props}
        />
        <CaseSensitive className="w-4 h-4 text-muted absolute right-0 top-0 translate-y-1/2 pointer-events-none" />
      </div>
    );
  }
);
TableInput.displayName = "TableInput";

export { TableInput };

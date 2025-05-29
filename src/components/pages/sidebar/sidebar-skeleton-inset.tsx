import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SidebarSekeltonInset = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("space-y-4", className)} {...props}>
                <Skeleton className="mx-auto h-24 w-full" />
                <Skeleton className="mx-auto h-[60vh] w-full" />
            </div>
        );
    }
);

SidebarSekeltonInset.displayName = "SidebarSekeltonInset";
export default SidebarSekeltonInset;

import { Typography } from "@/components/ui/Typoghraphy";
import { ReactNode } from "react";

export default function ParamGroup({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex items-center gap-4 flex-col p-2">
            <Typography variant="secondary">{title}</Typography>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}

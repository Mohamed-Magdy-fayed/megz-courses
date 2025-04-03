import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-accent dark:bg-muted grid place-content-center", className)}
      {...props}
    />
  )
}

export { Skeleton }

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Tabs = ({ defaultValue, id, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) => {
  const [activeTab, setActiveTab] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const storedTab = sessionStorage.getItem(`activeTab${id}`);
    setActiveTab(storedTab || defaultValue);
  }, [defaultValue]);

  const handleValueChange = (value: string) => {
    sessionStorage.setItem(`activeTab${id}`, value);
    setActiveTab(value);
  };

  return (
    <TabsPrimitive.Root value={activeTab} onValueChange={handleValueChange} {...props} />
  );
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <ScrollArea className="w-full pb-4">
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center rounded-md bg-accent/20 p-1 text-muted",
        className
      )}
      {...props}
    />
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogoForeground } from "./Logo";

export const mainNavLinks = [
  {
    label: "Dashboard",
    url: "dashboard",
  },
  {
    label: "Orders",
    url: "orders",
  },
  {
    label: "Students",
    url: "students",
  },
  {
    label: "Staff",
    url: "staff",
  },
  {
    label: "Sales Team",
    url: "sales-agents",
  },
  {
    label: "Chat Team",
    url: "chat-agents",
  },
  {
    label: "Content Management",
    url: "content",
  },
  {
    label: "Database",
    url: "database",
  },
  {
    label: "Configurations",
    url: "config",
  },
  {
    label: "Account",
    url: "account",
  },
  {
    label: "Login or Register",
    onClick: () => {
      signOut({ callbackUrl: `/authentication` })
    },
  },
  {
    label: "Error",
    url: "404",
  },
];

export default function MegzDrawer() {
  const pathname = usePathname();

  const navStore = useNavStore();


  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-4 overflow-auto bg-muted text-muted-foreground p-4">
      <div>
        <LogoForeground className='bg-muted-foreground' />
      </div>
      <div className="rounded-lg bg-muted-foreground/50 p-4 w-full text-foreground">
        <Typography variant={"secondary"} >Megz</Typography>
        <Typography>Development</Typography>
      </div>
      <Separator />
      <ScrollArea className="w-min h-screen">
        <div className="flex flex-col items-center gap-2">
          {mainNavLinks.map((link) => {
            if (link.onClick) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className={cn("whitespace-nowrap text-left w-full rounded-lg bg-transparent p-2 font-bold hover:bg-muted-foreground/80 hover:text-muted")}
                >
                  {link.label}
                </button>
              )
            }

            return (
              <Link
                key={link.url}
                onClick={() => {
                  navStore.closeNav();
                }}
                className={cn(
                  "whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-muted-foreground/80 hover:text-muted",
                  pathname && pathname.split("/")[1] === link.url &&
                  "bg-muted-foreground text-muted"
                )}
                href={`/${link.url}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="py-4">
        <Typography>
          Need different featrues?
        </Typography>
        <Typography className="whitespace-nowrap !text-xs">
          <Link
            className="text-dark underline decoration-slate-700 hover:decoration-dark"
            href="https://portfolio-2-iota-brown.vercel.app/"
            target="_blank"
          >
            Contact
          </Link>{" "}
          me for customizations
        </Typography>
      </div>
    </div>
  );
}

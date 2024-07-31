import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { usePathname } from "next/navigation";
import { LogoForeground } from "./Logo";
import Image from "next/image";
import { api } from "@/lib/api";

export const mainNavLinks = [
  {
    label: "Dashboard",
    url: "dashboard",
  },
  {
    label: "Retintions List",
    url: "retintions",
  },
  {
    label: "Notes",
    url: "notes",
  },
  {
    label: "Groups",
    url: "groups",
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
    label: "Sales Operations",
    url: "sales-operations",
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
    label: "Error",
    url: "404",
  },
];

export default function MegzDrawer() {
  const pathname = usePathname();
  const navStore = useNavStore();
  const { data } = api.siteIdentity.getSiteIdentity.useQuery()

  const [isMounted, setIsMounted] = useState(false);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeLinkRef.current) {
      activeLinkRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [pathname, activeLinkRef.current, activeLinkRef]);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-4 overflow-auto bg-muted text-muted-foreground p-4">
      <Image src={data?.siteIdentity.logoForeground || ""} height={1000} width={1000} alt="Logo" className='w-24 rounded-full bg-accent' />
      <div className="rounded-lg bg-muted-foreground/50 p-4 w-full text-foreground">
        <Typography variant={"secondary"} >Megz</Typography>
        <Typography>Development</Typography>
      </div>
      <Separator />
      <ScrollArea className="w-min h-screen">
        <div className="flex flex-col items-center gap-2">
          {mainNavLinks.map((link) => {
            const isActive = pathname && pathname.split("/")[1] === link.url;
            const linkProps = {
              key: link.url,
              className: cn(
                "whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-muted-foreground/80 hover:text-muted",
                isActive && "bg-muted-foreground text-muted"
              ),
              ...(isActive ? { ref: activeLinkRef } : {}),
            };

            return (
              <Link
                onClick={() => {
                  navStore.closeNav();
                }}
                href={`/${link.url}`}
                {...linkProps}
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

import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogoForeground } from "@/components/layout/Logo";
import { SiteIdentity } from "@prisma/client";

export const mainNavLinks = [
  {
    label: "Dashboard",
    url: "dashboard",
  },
  {
    label: "Waiting List",
    url: "waiting_list",
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
    label: "Educational Team",
    url: "edu_team",
  },
  {
    label: "Operational Team",
    url: "ops_team",
  },
  {
    label: "Chat Team",
    url: "chat_agents",
  },
  {
    label: "Content Management",
    url: "content",
  },
  {
    label: "Leads",
    url: "leads",
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
    label: "Privacy Policy",
    url: "privacy",
  },
  {
    label: "Terms of Use",
    url: "terms",
  },
  {
    label: "Documentation",
    url: "documentation",
  },
  {
    label: "Support",
    url: "support",
  },
  {
    label: "Tickets",
    url: "tickets",
  },
];

export default function MegzDrawer({ siteIdentity }: { siteIdentity?: SiteIdentity }) {
  const pathname = usePathname();
  const navStore = useNavStore();

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
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-2 overflow-auto bg-muted text-muted-foreground p-4">
      {siteIdentity?.logoForeground ? (
        <Image
          src={siteIdentity.logoForeground}
          height={1000}
          width={1000}
          alt="Logo"
          className='w-24 rounded-full bg-accent'
        />
      ) : (
        <LogoForeground className="w-20 h-40 bg-accent" />
      )}
      <div className="rounded-lg bg-muted-foreground/50 px-4 py-2 w-full text-foreground">
        <Typography variant={"secondary"} >Megz</Typography>
        <Typography>Development</Typography>
        <div>Version: 1.1.0</div>
      </div>
      <Separator />
      <ScrollArea className="w-min h-full pr-4">
        <div className="flex flex-col items-center gap-2">
          {mainNavLinks.map((link) => {
            const isActive = pathname && pathname.split("/")[1] === link.url;
            const linkProps = {
              key: link.url,
              className: cn(
                "whitespace-nowrap w-full rounded-lg bg-transparent p-2 py-1 font-bold hover:bg-muted-foreground/80 hover:text-muted",
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
            href="https://megz-portfolio-dev.vercel.app/"
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

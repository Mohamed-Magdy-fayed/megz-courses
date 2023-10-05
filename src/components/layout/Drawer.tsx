import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function MegzDrawer({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname().split("/")[1];
  const navStore = useNavStore();

  const links = [
    {
      label: "Overview",
      url: "",
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
      label: "Settings",
      url: "settings",
    },
    {
      label: "Login or Register",
      url: "login",
    },
    {
      label: "Error",
      url: "404",
    },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-4 overflow-auto bg-muted text-muted-foreground p-4">
      <Image src="/favicon.png" width={80} height={80} alt="logo" />
      <div className="rounded-lg bg-muted-foreground/50 p-4 w-full text-foreground">
        <Typography variant={"secondary"} >Megz</Typography>
        <Typography>Development</Typography>
      </div>
      <Separator />
      <ScrollArea className="w-min h-screen">
        <div className="flex flex-col items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.url}
              onClick={() => {
                navStore.closeNav();
              }}
              className={cn(
                "whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-muted-foreground/80 hover:text-muted",
                pathname === link.url &&
                "bg-muted-foreground text-muted"
              )}
              href={`/${link.url}`}
            >
              {link.label}
            </Link>
          ))}
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

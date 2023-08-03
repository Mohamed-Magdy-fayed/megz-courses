import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import { Box, Divider, Typography } from "@mui/material";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import React from "react";

export default function MegzDrawer() {
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
      label: "Content Management",
      url: "content",
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

  return (
    <div className="flex h-screen flex-col gap-4 overflow-auto sticky top-0 left-0 bg-primary p-4">
      <img src="/favicon.png" className="w-20" />
      <Box component="div" className="rounded-lg bg-slate-100/10 p-4">
        <Typography className="font-sans text-xl font-bold text-slate-50">
          Megz
        </Typography>
        <Typography className="text-sm text-slate-300">Development</Typography>
      </Box>
      <Divider></Divider>
      <Box
        component="div"
        className="flex flex-col items-center gap-2 [&>*]:w-full [&>*]:rounded-lg [&>*]:bg-transparent [&>*]:p-2 [&>*]:font-bold [&>*]:text-slate-300 hover:[&>*]:bg-slate-100/10"
      >
        {links.map((link) => (
          <Link
            key={link.url}
            onClick={() => navStore.closeNav()}
            className={cn(
              "whitespace-nowrap",
              navStore.activeLink === link.url &&
                "!bg-slate-100/10 !text-slate-100"
            )}
            href={`/${link.url}`}
          >
            {link.label}
          </Link>
        ))}
      </Box>
      <Divider></Divider>
      <Box component="div">
        <Typography className="text-base text-slate-50">
          Need different featrues?
        </Typography>
        <Typography className="text-sm text-slate-300 whitespace-nowrap">
          <Link
            className="text-dark underline decoration-slate-700 hover:decoration-dark"
            href="https://portfolio-2-iota-brown.vercel.app/"
            target="_blank"
          >
            Contact
          </Link>{" "}
          me for customizations
        </Typography>
      </Box>
    </div>
  );
}

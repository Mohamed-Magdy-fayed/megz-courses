import { cn } from "@/lib/utils";
import { useNavStore, useTutorialStore } from "@/zustand/store";
import { Box, Divider, Typography } from "@mui/material";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import TutorialPopover from "../tutorials/TutorialPopover";
import { Button } from "../ui/button";
import { SkipForward } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useRouter } from "next/router";

export default function MegzDrawer({ mobile }: { mobile?: boolean }) {
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

  const router = useRouter();
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sticky left-0 top-0 flex h-screen flex-col gap-4 overflow-auto bg-primary p-4">
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
            onClick={() => {
              navStore.closeNav();
              setStep(true, "clickContent");
            }}
            className={cn(
              "whitespace-nowrap after:aspect-square",
              navStore.activeLink === link.url &&
                "!bg-slate-100/10 !text-slate-100",
              !steps.clickContent &&
                !skipTutorial &&
                ((steps.openMenu && navStore.opened && mobile) || !mobile) &&
                link.label === "Content Management" &&
                router.route === "/" &&
                `tutorial-ping relative before:absolute before:translate-y-full before:rounded before:bg-slate-50 before:p-4 before:text-slate-700 before:content-["Content_got_better!"]`
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
        <Typography className="whitespace-nowrap text-sm text-slate-300">
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

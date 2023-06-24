import { useNavStore } from "@/zustand/store";
import { Box, Divider, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

export default function MegzDrawer() {
  const navStore = useNavStore((state) => state);
  const active = "!text-slate-100 !bg-slate-100/10";

  return (
    <Box
      component="div"
      className="lg:sticky absolute top-0 flex min-h-screen flex-col gap-4 bg-primary p-4"
    >
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
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "" ? active : ""}
          href="/"
        >
          Overview
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "students" ? active : ""}
          href="/students"
        >
          Students
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "staff" ? active : ""}
          href="/staff"
        >
          Staff
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "account" ? active : ""}
          href="/account"
        >
          Account
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "settings" ? active : ""}
          href="/settings"
        >
          Settings
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "login" ? active : ""}
          href="/authentication"
        >
          Login or Register
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "404" ? active : ""}
          href="/404"
        >
          Error
        </Link>
      </Box>
      <Divider></Divider>
      <Box component="div">
        <Typography className="text-base text-slate-50">
          Need different featrues?
        </Typography>
        <Typography className="text-sm text-slate-300">
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
    </Box>
  );
}

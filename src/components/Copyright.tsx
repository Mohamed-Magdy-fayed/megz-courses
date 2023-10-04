import React from "react";
import { Typography } from "./ui/Typoghraphy";
import Link from "next/link";

export default function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link
        target="_blank"
        href="https://portfolio-2-iota-brown.vercel.app/"
      >
        Megz
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

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
        color="inherit"
        href="https://portfolio-2-iota-brown.vercel.app/"
      >
        Megz
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

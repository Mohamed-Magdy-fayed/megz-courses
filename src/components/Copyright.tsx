import { Typography } from "./ui/Typoghraphy";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Copyright(props: any) {
  return (
    <Typography
      className="text-center w-full"
      {...props}
    >
      {"Copyright © "}
      <Link
        target="_blank"
        href="https://gateling.com/"
      >
        <Button variant={"link"}>Gateling</Button>
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}{" "}
      <Link
        href="/privacy"
      >
        <Button variant={"link"}>Privacy Policy</Button>
      </Link>{" | "}
      <Link
        href="/terms"
      >
        <Button variant={"link"}>Terms of Use</Button>
      </Link>{" "}
    </Typography>
  );
}

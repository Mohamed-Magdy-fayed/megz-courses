import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine } from "lucide-react";
import Link from "next/link";

const Page = () => (
  <main className="items-center flex flex-grow min-h-full"  >
    <div>
      <div className="flex flex-col items-center">
        <div className="text-center mb-4">
          <img
            alt="Under development"
            src="/error-404.png"
            style={{
              display: "inline-block",
              maxWidth: "100%",
              width: 400,
            }}
          />
        </div>
        <Typography className="mb-4">
          404: The page you are looking for isn’t here
        </Typography>
        <Typography className="text-secondary" variant="bodyText">
          You either tried some shady route or you came here by mistake.
          Whichever it is, try using the navigation
        </Typography>
        <Button>
          <Link href="/">
            <ArrowLeftToLine />Go back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  </main>
);

export default Page;

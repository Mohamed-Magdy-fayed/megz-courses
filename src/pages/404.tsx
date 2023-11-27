import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  (
    <main className="items-center justify-center flex flex-grow min-h-screen w-screen"  >
      <div>
        <div className="flex flex-col items-center p-8">
          <div className="text-center mb-4">
            <Image
              alt="Under development"
              src="/error-404.png"
              width={400}
              height={400}
            />
          </div>
          <Typography variant={"primary"} className="mb-4 text-center">
            404: The page you are looking for isn’t here
          </Typography>
          <Typography className="mb-8" variant="secondary">
            You either tried some shady route or you came here by mistake.
            Whichever it is, try using the navigation
          </Typography>
          <Link href="/">
            <Button >
              <ArrowLeftToLine />Go back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/server/permissions";
import { ArrowLeftToLine, Home } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function NotFoundPage() {
  const session = useSession()
  const router = useRouter()

  return (
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
            You may have came here by mistake.
            try using the navigation
          </Typography>
          <div className="flex items-center justify-around w-full">
            <Button onClick={() => router.back()} className="flex gap-2" variant={"outline"} customeColor={"primaryOutlined"}>
              <ArrowLeftToLine />
              <Typography>Go back</Typography>
            </Button>
            <Link href={session.data?.user && hasPermission(session.data.user, "adminLayout", "view") ? "/admin/dashboard" : "/"}>
              <Button className="flex gap-2">
                <Home />
                <Typography>Go to {session.data?.user && hasPermission(session.data.user, "adminLayout", "view") ? "Dashboard" : "home page"}</Typography>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

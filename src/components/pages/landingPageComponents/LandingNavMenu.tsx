import Link from "next/link"
import { SiteIdentity } from "@prisma/client"
import { Typography } from "@/components/ui/Typoghraphy"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { DesktopAuthenticatedProfileMenu, MobileAuthenticatedProfileMenu } from "@/components/pages/landingPageComponents/AuthedProfile"
import { LogoForeground } from "@/components/pages/adminLayout/Logo"
import { DesktopUnauthenticatedProfileMenu, MobileUnauthenticatedProfileMenu } from "@/components/pages/landingPageComponents/NoAuthProfile"
import { NotificationDropdown } from "@/components/general/notifications/NotificationDropdown";

export const LandingNavigationMenu = ({ siteIdentity }: { siteIdentity?: SiteIdentity }) => {
  const session = useSession()

  return (
    <div className="w-full z-10 py-2 px-4 md:px-8 md:py-4 max-w-7xl lg:mx-auto">
      <div className="grid items-center grid-cols-12 border-b border-primary">
        {/* Logo and home link */}
        <div className="col-span-8 flex items-center">
          <Link href={'/'} className="flex items-center gap-1 justify-center w-fit">
            {siteIdentity ? (
              <Image src={siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-12 rounded-full' />
            ) : (
              <LogoForeground className="w-12 h-12" />
            )}
            <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
              {siteIdentity?.name1 || "Gateling"}
            </Typography>
            <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
              {siteIdentity?.name2 || "TMS"}
            </Typography>
          </Link>
        </div>

        <div className="flex col-span-4 items-center gap-4 justify-end">
          {/* Notification Dropdown using NotificationList */}
          <NotificationDropdown />

          {!session.data?.user && session.status !== "authenticated" ? (
            <>
              <MobileUnauthenticatedProfileMenu />
              <DesktopUnauthenticatedProfileMenu />
            </>
          ) : (
            <>
              <MobileAuthenticatedProfileMenu />
              <DesktopAuthenticatedProfileMenu />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

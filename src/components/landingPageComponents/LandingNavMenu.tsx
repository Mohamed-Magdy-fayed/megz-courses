import Link from "next/link"
import { SiteIdentity, UserNoteStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { BellRing, EyeIcon, EyeOffIcon, InfoIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect } from "react"
import { LogoForeground } from "../layout/Logo"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { ScrollArea } from "../ui/scroll-area"
import Image from "next/image"
import { SeverityPill } from "@/components/overview/SeverityPill"
import { BellIcon } from "lucide-react"
import { format } from "date-fns"
import { DesktopUnauthenticatedProfileMenu, MobileUnauthenticatedProfileMenu } from "@/components/landingPageComponents/NoAuthProfile"
import { DesktopAuthenticatedProfileMenu, MobileAuthenticatedProfileMenu } from "@/components/landingPageComponents/AuthedProfile"

export const LandingNavigationMenu = ({ siteIdentity }: { siteIdentity?: SiteIdentity }) => {
  const session = useSession()
  const trpcUtils = api.useUtils()
  const { data } = api.notes.getActiveUserNotes.useQuery(undefined, { enabled: session.status === "authenticated" })
  const editNoteQuery = api.notes.editNoteStatus.useMutation({ onSettled: () => trpcUtils.notes.invalidate() })
  const editUserQuery = api.users.editUser.useMutation()

  const changeStatus = (id: string, status: UserNoteStatus) => {
    editNoteQuery.mutate({ id, status })
  }

  useEffect(() => {
    if (!session.data?.user) return
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /Tablet|iPad/i.test(navigator.userAgent);
    const getDevice = () => isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'

    if (session.data.user.device === (getDevice()) || !session.data.user.emailVerified) return
    editUserQuery.mutate({
      id: session.data?.user.id || "",
      name: session.data?.user.name || "",
      email: session.data?.user.email || "",
      device: getDevice(),
    })
  }, [session.data?.user])

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
          {data?.notes && (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative mx-4">
                {data.notes.filter(n => n.status !== "Closed").length > 0 && <InfoIcon className="absolute rounded-full text-destructive-foreground bg-destructive -top-2.5 -right-2.5 size-3" />}
                {data.notes.filter(n => n.status !== "Closed").length > 0 ? <BellRing className="size-4" /> : <BellIcon className="size-4" />}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  Notes {data.notes.filter(n => n.status !== "Closed").length > 0 && <SeverityPill color="destructive" className="aspect-square inline-flex">{data?.notes.filter(n => n.status !== "Closed").length}</SeverityPill>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <ScrollArea className="max-h-96">
                    {data.notes.map(note => (
                      <DropdownMenuItem
                        key={note.id}
                        onClick={(e) => {
                          e.preventDefault()
                          note.status !== "Closed" && changeStatus(note.id, "Closed")
                        }}
                        className={cn("flex items-center justify-between w-full gap-4 hover:!bg-muted/10 hover:!text-foreground focus-visible:bg-muted/10 focus-visible:text-foreground", note.status !== "Closed" && "bg-primary/10 text-foreground hover:!bg-primary/20")}
                      >
                        <div className="grid gap-4 max-w-md">
                          <Typography variant="secondary">
                            {note.title}
                          </Typography>
                          <Typography className="whitespace-pre-wrap truncate">
                            {note.messages[0]?.message}
                          </Typography>
                          <Typography className="text-xs text-info">
                            {format(note.updatedAt, "PPp")}
                          </Typography>
                        </div>
                        {note.status !== "Closed" ? (
                          <Button onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(note.id, "Closed")
                          }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                            <EyeOffIcon className="size-4" />
                          </Button>
                        ) : (
                          <Button onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(note.id, "Opened")
                          }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                            <EyeIcon className="size-4" />
                          </Button>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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

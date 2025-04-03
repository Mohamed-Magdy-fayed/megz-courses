import { cn, getVersion } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/Typoghraphy";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogoForeground } from "@/components/pages/adminLayout/Logo";
import { SiteIdentity } from "@prisma/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { hasPermission } from "@/server/permissions";
import { useSession } from "next-auth/react";

export type NavLink = { label: string; url?: string; }

export const mainNavLinks: (NavLink & { children?: NavLink[] })[] = [
  {
    label: "Dashboard",
    url: "admin/dashboard",
  },
  {
    label: "Operations Management",
    children: [
      {
        label: "Notes",
        url: "admin/operations_management/notes",
      },
      {
        label: "Groups",
        url: "admin/operations_management/groups",
      },
      {
        label: "Trainee Lists",
        url: "admin/operations_management/trainee_lists",
      },
      {
        label: "Placement Tests",
        url: "admin/operations_management/placement_tests",
      },
      {
        label: "Sessions",
        url: "admin/operations_management/sessions",
      },
    ],
  },
  {
    label: "Sales Management",
    children: [
      {
        label: "Orders",
        url: "admin/sales_management/orders",
      },
      {
        label: "Leads",
        url: "admin/sales_management/leads",
      },
    ],
  },
  {
    label: "Users Management",
    children: [
      {
        label: "Students",
        url: "admin/users_management/students",
      },
      {
        label: "Operational Team",
        url: "admin/users_management/ops_team",
      },
      {
        label: "Educational Team",
        url: "admin/users_management/edu_team",
      },
      // {
      //   label: "Chat Team",
      //   url: "admin/users_management/chat_agents",
      // },
      {
        label: "Account",
        url: "admin/users_management/account",
      },
    ],
  },
  {
    label: "System Management",
    children: [
      {
        label: "Configurations",
        url: "admin/system_management/config",
      },
      {
        label: "Content Management",
        url: "admin/system_management/content",
      },
      {
        label: "Products Management",
        url: "admin/system_management/products",
      },
    ],
  },
  {
    label: "General",
    children: [

      {
        label: "Privacy Policy",
        url: "privacy",
      },
      {
        label: "Terms of Use",
        url: "terms",
      },
      {
        label: "Documentation",
        url: "documentation",
      },
      {
        label: "Support",
        url: "support",
      },
      {
        label: "Tickets",
        url: "admin/tickets",
      },
    ],
  },
];

export default function MegzDrawer({ siteIdentity }: { siteIdentity?: SiteIdentity }) {
  const pathname = usePathname();
  const navStore = useNavStore();
  const session = useSession();

  const [openLinksGroup, setOpenLinksGroup] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  const allowedNavLinks = mainNavLinks
    .filter(link => session.data?.user && hasPermission(session.data.user, "screens", "view", link))
    .map(link => ({
      ...link,
      children: link.children?.filter(ch => session.data?.user && hasPermission(session.data.user, "screens", "view", ch))
    }))

  useEffect(() => {
    if (activeLinkRef.current) {
      activeLinkRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setOpenLinksGroup(allowedNavLinks.find(link => pathname.startsWith(`/${link.url}`) || link.children?.some(ch => pathname.startsWith(`/${ch.url}`)))?.label || "")
    }
  }, [pathname, activeLinkRef.current, activeLinkRef]);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted || !pathname) return null;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-2 overflow-auto bg-muted text-muted-foreground p-4">
      {siteIdentity?.logoForeground ? (
        <Image
          src={siteIdentity.logoForeground}
          height={1000}
          width={1000}
          alt="Logo"
          className='w-24 rounded-full bg-accent'
        />
      ) : (
        <LogoForeground className="w-20 h-40 bg-accent" />
      )}
      <div className="rounded-lg bg-muted-foreground/50 px-4 py-2 w-full text-foreground">
        <Typography variant={"secondary"} >Gateling</Typography>
        <Typography>Solutions</Typography>
        <div>Version: {getVersion()}</div>
      </div>
      <Separator />
      <ScrollArea className="w-full h-full pr-2">
        <Accordion type="single" collapsible value={openLinksGroup} onValueChange={(val) => setOpenLinksGroup(val)}>
          <div className="flex flex-col items-center gap-2 ">
            {allowedNavLinks.map((link) => {
              const isActive = pathname === link.url || link.children?.some(l => pathname.startsWith(`/${l.url}`));
              const linkProps = {
                key: link.label,
                className: cn(
                  "whitespace-nowrap w-full rounded-lg bg-transparent p-2 py-1 font-bold hover:bg-muted-foreground/80 hover:text-muted",
                  isActive && "bg-muted-foreground text-muted"
                ),
                ...(isActive ? { ref: activeLinkRef } : {}),
              };

              if (link.url) {
                return (
                  <Link
                    onClick={() => {
                      navStore.closeNav();
                    }}
                    href={`/${link.url}`}
                    {...linkProps}
                  >
                    {link.label}
                  </Link>
                )
              }

              if (link.children) {
                return (
                  <AccordionItem value={link.label} key={link.label} className="border-b-0 w-full">
                    <AccordionTrigger
                      className={cn(
                        "whitespace-nowrap [&[data-state=open]]:bg-muted-foreground/80 [&[data-state=open]]:text-muted w-full rounded-lg gap-2 bg-transparent p-2 py-1 font-bold hover:bg-muted-foreground/80 hover:text-muted hover:no-underline",
                        isActive && "bg-muted-foreground/80 text-muted"
                      )}
                    >
                      {link.label}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col items-center gap-2 pt-2">
                        {link.children.map(child => {
                          const isChildActive = pathname.startsWith(`/${child.url}`);
                          const childLinkProps = {
                            key: child.url,
                            className: cn(
                              "whitespace-nowrap w-full rounded-lg bg-transparent p-2 py-1 font-bold hover:bg-muted-foreground/80 hover:text-muted",
                              isChildActive && "bg-muted-foreground text-muted"
                            ),
                            ...(isChildActive ? { ref: activeLinkRef } : {}),
                          };

                          return (
                            <Link
                              onClick={() => {
                                navStore.closeNav();
                              }}
                              href={`/${child.url}`}
                              {...childLinkProps}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              }
            })}
          </div>
        </Accordion>
        {/* <div className="flex flex-col items-center gap-2">
          {mainNavLinks.map((link) => {
            const isActive = pathname && pathname.split("/")[1] === link.url;
            const linkProps = {
              key: link.url,
              className: cn(
                "whitespace-nowrap w-full rounded-lg bg-transparent p-2 py-1 font-bold hover:bg-muted-foreground/80 hover:text-muted",
                isActive && "bg-muted-foreground text-muted"
              ),
              ...(isActive ? { ref: activeLinkRef } : {}),
            };

            return (
              <Link
                onClick={() => {
                  navStore.closeNav();
                }}
                href={`/${link.url}`}
                {...linkProps}
              >
                {link.label}
              </Link>
            )
          })}
        </div> */}
      </ScrollArea>
      <Separator />
      <div className="py-4">
        <Typography>
          Need different featrues?
        </Typography>
        <Typography className="whitespace-nowrap !text-xs">
          <Link
            className="text-dark underline decoration-slate-700 hover:decoration-dark"
            href="https://gateling.com/"
            target="_blank"
          >
            Contact
          </Link>{" "}
          us for customizations
        </Typography>
      </div>
    </div>
  );
}

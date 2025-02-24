import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { BookMinus, BookOpen, BookOpenCheck, FileBadge } from "lucide-react";
import { LearningLayoutCourseType, LearningLayoutLevelType, LearningLayoutUserType } from "@/components/LearningLayout/LearningLayout";
import Image from "next/image";
import { LogoPrimary } from "@/components/layout/Logo";
import { SiteIdentity } from "@prisma/client";

export default function LearningDrawer({ level, course, user, siteIdentity }: {
  level?: LearningLayoutLevelType;
  course: LearningLayoutCourseType;
  user: LearningLayoutUserType;
  siteIdentity?: SiteIdentity;
}) {
  const navStore = useNavStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true)
  }, []);

  if (!isMounted) return null;
  if (!course) return <Typography>No Course Found!</Typography>;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-4 overflow-auto bg-foreground text-background p-4">
      {siteIdentity?.logoPrimary ? (
        <Image src={siteIdentity.logoPrimary} height={1000} width={1000} alt="Logo" className='w-24 rounded-full' />
      ) : (
        <LogoPrimary className="w-24 h-24" />
      )}
      <div className="rounded-lg bg-primary p-4 w-full text-primary-foreground">
        <Typography variant={"secondary"} className="whitespace-nowrap text-center">Start learning</Typography>
      </div>
      <Separator className="bg-primary" />
      {!level ? course.levels
        .filter(lvl => user.courseStatus.some(({ courseId, courseLevelId }) => courseId === course.id && courseLevelId === lvl.id))
        .map(lvl => (
          <Link
            onClick={() => {
              navStore.closeNav();
            }}
            href={`/student/my_courses/${course.slug}/${lvl.slug}`}
            key={lvl.id}
            className="hover:no-underline whitespace-nowrap w-full rounded-lg bg-transparent p-2 my-2 font-bold hover:bg-primary hover:text-primary-foreground"
          >
            {lvl.name}
          </Link>
        )) : (
        <>
          <Typography variant={"secondary"}>{level.name}</Typography>
          {level.materialItems.length === 0 && <Typography>No materials available yet!</Typography>}
          <ScrollArea className="w-min h-[50vh]">
            <div className="flex flex-col items-center gap-2">
              {user.courseStatus.some(s => s.courseId === course.id && s.status === "Waiting") ? (
                <Typography className="whitespace-nowrap">
                  Group not started yet
                </Typography>
              ) : (
                <Accordion type="multiple">
                  {level.materialItems.map((item, i) => {
                    const zoomSession = user.zoomGroups.map(group =>
                      group.zoomSessions.find(session => session.materialItemId === item.id)?.materialItemId === item.id
                        ? group.zoomSessions.find(session => session.materialItemId === item.id)
                        : null).filter(s => s !== null)[0]

                    return (
                      <AccordionItem key={item.id} value={item.id} className="border-0">
                        <AccordionTrigger
                          className="hover:no-underline whitespace-nowrap w-full rounded-lg bg-transparent p-2 my-2 font-bold hover:bg-primary hover:text-primary-foreground"
                        >
                          <Typography className="mr-2">
                            {`Session ${i + 1}: ${item.title}`}
                          </Typography>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-2">
                            <Link
                              className={cn(
                                "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground",
                                zoomSession?.sessionStatus === "Scheduled" && "pointer-events-none text-muted",
                              )}
                              href={`/student/my_courses/${course.slug}/${level.slug}/Quiz/${item.slug}`}
                              onClick={() => {
                                navStore.closeNav();
                              }}
                            >
                              <Typography>
                                {`Session ${i + 1} Quiz`}
                              </Typography>
                              <BookMinus className="w-4 h-4" />
                            </Link>
                            <Link
                              className={cn(
                                "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground",
                                (zoomSession?.sessionStatus && ["Starting", "Scheduled"].includes(zoomSession.sessionStatus)) && "pointer-events-none text-muted",
                              )}
                              href={`/student/my_courses/${course.slug}/${level.slug}/session/${item.slug}`}
                              onClick={() => {
                                navStore.closeNav();
                              }}
                            >
                              <Typography>
                                {`Session ${i + 1} content`}
                              </Typography>
                              <BookOpen className="w-4 h-4" />
                            </Link>
                            <Link
                              className={cn(
                                "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground",
                                zoomSession?.sessionStatus !== "Completed" && "pointer-events-none text-muted",
                              )}
                              href={`/student/my_courses/${course.slug}/${level.slug}/Assignment/${item.slug}`}
                              onClick={() => {
                                navStore.closeNav();
                              }}
                            >
                              <Typography>
                                {`Session ${i + 1} Assignment`}
                              </Typography>
                              <BookOpenCheck className="w-4 h-4" />
                            </Link>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                  <AccordionItem value="course-completion" className="border-0">
                    <AccordionTrigger
                      className="hover:no-underline whitespace-nowrap w-full rounded-lg bg-transparent p-2 my-2 font-bold hover:bg-primary hover:text-primary-foreground"
                    >
                      Course Completion
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2">
                        <Link
                          className={cn(
                            "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground",
                            !user.zoomGroups.some(group => group.courseId === course.id && group.zoomSessions.every(session => session.sessionStatus === "Completed")) && "pointer-events-none text-muted"
                          )}
                          onClick={() => {
                            navStore.closeNav();
                          }}
                          href={`/student/my_courses/${course.slug}/${level.slug}/final_test`}
                        >
                          <Typography>
                            Final Test
                          </Typography>
                          <BookOpenCheck className="w-4 h-4" />
                        </Link>
                        <Link
                          className={
                            cn(
                              "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground",
                              !user.certificates.find(cert => cert.courseLevel?.slug === level?.slug)?.id && "pointer-events-none text-muted",
                            )
                          }
                          href={`/student/my_courses/${course.slug}/${level.slug}/certificate`}
                        >
                          <Typography>
                            Certificate
                          </Typography>
                          <FileBadge className="w-4 h-4" />
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )
              }
            </div>
          </ScrollArea>
        </>
      )}
      <Separator className="bg-primary" />
    </div>
  );
}

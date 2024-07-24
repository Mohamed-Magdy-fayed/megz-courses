import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { LogoPrimary } from "../layout/Logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { BookMinus, BookOpen, BookOpenCheck, FileBadge } from "lucide-react";
import { LearningLayoutCourseType, LearningLayoutLevelType, LearningLayoutUserType } from "@/components/LearningLayout/LearningLayout";

export default function LearningDrawer({ level, course, user }: {
  level?: LearningLayoutLevelType;
  course: LearningLayoutCourseType;
  user: LearningLayoutUserType;
}) {
  const navStore = useNavStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true)
  }, []);

  if (!isMounted) return null;
  if (!course) return <Typography>No Course Found!</Typography>;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-4 overflow-auto bg-primary-foreground text-foreground p-4">
      <div>
        <LogoPrimary className="bg-primary-foreground" />
      </div>
      <div className="rounded-lg bg-primary p-4 w-full text-primary-foreground">
        <Typography variant={"secondary"} className="whitespace-nowrap">Start learning</Typography>
      </div>
      <Separator className="bg-primary" />
      {!level ? course.levels
        .filter(lvl => user.courseStatus.some(({ courseId, courseLevelId }) => courseId === course.id && courseLevelId === lvl.id))
        .map(lvl => (
          <Link
            onClick={() => {
              navStore.closeNav();
            }}
            href={`/my_courses/${course.slug}/${lvl.slug}`}
            key={lvl.id}
            className="hover:no-underline whitespace-nowrap w-full rounded-lg bg-transparent p-2 my-2 font-bold hover:bg-primary hover:text-primary-foreground"
          >
            {lvl.name}
          </Link>
        )) : (
        <>
          <Typography variant={"secondary"}>{level.name}</Typography>
          {level.materialItems.length === 0 && <Typography>No materials available yet!</Typography>}
          <ScrollArea className="w-min h-screen">
            <div className="flex flex-col items-center gap-2">
              <Accordion type="multiple">
                {level.materialItems.map((item, i) => {
                  const zoomSessionDate = user.zoomGroups.map(group =>
                    group.zoomSessions.find(session => session.materialItemId === item.id)?.materialItemId === item.id
                      ? group.zoomSessions.find(session => session.materialItemId === item.id)
                      : null).filter(s => s)[0]?.sessionDate

                  return (
                    <AccordionItem key={item.id} value={item.id} className="border-0">
                      <AccordionTrigger
                        className="hover:no-underline whitespace-nowrap w-full rounded-lg bg-transparent p-2 my-2 font-bold hover:bg-primary hover:text-primary-foreground"
                      >
                        <Typography>
                          {`Session ${i + 1}: ${item.title}`}
                        </Typography>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2">
                          <Link
                            className={cn(
                              "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground",
                              (!item.evaluationForms.find(form => form.type === "quiz")?.id
                                || zoomSessionDate! > new Date()
                              ) && "pointer-events-none text-primary/30",
                            )}
                            href={`/my_courses/${course.slug}/${level.slug}/quiz/${item.slug}`}
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
                              zoomSessionDate! > new Date() && "pointer-events-none text-primary/30",
                            )}
                            href={`/my_courses/${course.slug}/${level.slug}/session/${item.slug}`}
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
                              (!item.evaluationForms.find(form => form.type === "assignment")?.id
                                || zoomSessionDate! > new Date()
                              ) && "pointer-events-none text-primary/30",
                            )}
                            href={`/my_courses/${course.slug}/${level.slug}/assignment/${item.slug}`}
                            onClick={() => {
                              navStore.closeNav();
                            }}
                          >
                            <Typography>
                              {`Session ${i + 1} assignment`}
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
                          (
                            !level.evaluationForms.
                              find(form => form.type === "finalTest")?.id
                            || !user.zoomGroups
                              .find(group => group.zoomSessions
                                .every(session => session.sessionStatus === "completed"))
                          ) && "pointer-events-none text-primary/30",
                        )}
                        onClick={() => {
                          navStore.closeNav();
                        }}
                        href={`/my_courses/${course.slug}/${level.slug}/final_test`}
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
                            !level.evaluationForms.find(form => form.type === "finalTest")?.id && "pointer-events-none text-primary/30",
                            !user.certificates.find(cert => cert.courseLevel?.slug === level?.slug)?.id && "pointer-events-none text-primary/30",
                          )
                        }
                        href={`/my_courses/${course.slug}/${level.slug}/certificate`}
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
            </div>
          </ScrollArea>
        </>
      )}
      <Separator className="bg-primary" />
    </div>
  );
}

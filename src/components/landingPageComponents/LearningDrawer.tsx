import { cn } from "@/lib/utils";
import { useNavStore } from "@/zustand/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogoAccent, LogoForeground, LogoPrimary } from "../layout/Logo";
import { FullCourseType } from "@/lib/PrismaFullTypes";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { BookMinus, BookOpen, BookOpenCheck } from "lucide-react";
import { useRouter } from "next/router";

export default function LearningDrawer({ course }: { course: FullCourseType }) {
  const router = useRouter();
  const id = router.query.courseId as string;
  const navStore = useNavStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="sticky left-0 top-0 flex items-center h-screen flex-col gap-4 overflow-auto bg-primary-foreground text-foreground p-4">
      <div>
        <LogoPrimary className="bg-primary-foreground" />
      </div>
      <div className="rounded-lg bg-primary p-4 w-full text-primary-foreground">
        <Typography variant={"secondary"} className="whitespace-nowrap">Start learning</Typography>
      </div>
      <Separator className="bg-primary" />
      <ScrollArea className="w-min h-screen">
        <div className="flex flex-col items-center gap-2">
          <Accordion type="multiple">
            {course.materialItems.map((item, i) => (
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
                        !item.evaluationForms.find(form => form.type === "quiz")?.id && "pointer-events-none text-primary/30"
                      )}
                      href={`/my_courses/${id}/quiz/${item.evaluationForms.find(form => form.type === "quiz")?.id}`}
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
                      className="flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary hover:text-primary-foreground"
                      href={`/my_courses/${id}/session/${item.id}`}
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
                        "flex items-center justify-between gap-2 whitespace-nowrap w-full rounded-lg bg-transparent p-2 font-bold hover:bg-primary/80 hover:text-primary-foreground",
                        !item.evaluationForms.find(form => form.type === "assignment")?.id && "pointer-events-none text-primary/30",
                        router && router.pathname === `/my_courses/${id}/assignment/${item.evaluationForms.find(form => form.type === "assignment")?.id}` && "bg-primary text-primary-foreground"
                      )}
                      href={`/my_courses/${id}/assignment/${item.evaluationForms.find(form => form.type === "assignment")?.id}`}
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
            ))}
          </Accordion>
        </div>
      </ScrollArea>
      <Separator className="bg-primary" />
      <div>

      </div>
    </div>
  );
}

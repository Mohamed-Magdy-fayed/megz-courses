import MegzDrawer from "@/components/layout/Drawer";
import MegzTopBar from "@/components/layout/TopBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavStore } from "@/zustand/store";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import Spinner from "../Spinner";
import UnauthorizedAccess from "./UnauthorizedAccess";
import { api } from "@/lib/api";
import { sendWhatsAppMessage } from "@/lib/whatsApp";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { opened, openNav, closeNav } = useNavStore();

  const { data: session, status } = useSession({ required: true })
  const mutation = api.zoomGroups.zoomGroupsCronJob.useMutation()
  const trpcUtils = api.useContext()

  useEffect(() => {
    mutation.mutate(undefined, {
      onSuccess: ({ ongoingSessionsData, completedSessionsData, soonToStartSessionsData }) => {
        ongoingSessionsData.forEach(session => {
          session.zoomGroup?.students.forEach(student => {
            sendWhatsAppMessage({
              toNumber: "201123862218",
              textBody: `Hi ${student.name}, your session for today has started, Please join from here: ${session.sessionLink}`,
            })
          })
        })
        completedSessionsData.forEach(session => {
          session.zoomGroup?.students.forEach(student => {
            sendWhatsAppMessage({
              toNumber: "201123862218",
              textBody: `Hi ${student.name}, your session for today has been completed, don't forget to submit your assignment here: ${window.location.host}/my_courses/${session.zoomGroup?.courseId}/assignment/${session.materialItem?.evaluationForms.find(form => form.type === "assignment")?.id}
              \nYou can also view the course materials here: ${window.location.host}/my_courses/${session.zoomGroup?.courseId}/session/${session.materialItemId}`,
            })
          })
        })
        soonToStartSessionsData.forEach((session, i) => {
          if (i === soonToStartSessionsData.length - 1) return session.zoomGroup?.students.forEach(student => {
            sendWhatsAppMessage({
              toNumber: "201123862218",
              textBody: `Hi ${student.name}, your final test is about to start, be ready!
              \nPlease complete your test here: ${window.location.host}/my_courses/${session.zoomGroup?.courseId}/quiz/${session.materialItem?.evaluationForms.find(form => form.type === "quiz")?.id}
              \nAnd join the meeting on time here: ${session.sessionLink}`,
            })
          })

          session.zoomGroup?.students.forEach(student => {
            sendWhatsAppMessage({
              toNumber: "201123862218",
              textBody: `Hi ${student.name}, your session for today is about to start, be ready!
              \nPlease complete your quiz here: ${window.location.host}/my_courses/${session.zoomGroup?.courseId}/quiz/${session.materialItem?.evaluationForms.find(form => form.type === "quiz")?.id}
              \nAnd join the meeting on time here: ${session.sessionLink}`,
            })
          })
        })
      },
      onSettled: () => trpcUtils.invalidate()
    })
  }, [new Date().getMinutes()])

  if (status === "loading" || !session.user) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  if (session.user.userType === "student") return <UnauthorizedAccess />

  return (
    <div className="flex">
      <Sheet
        open={opened}
        onOpenChange={() => opened ? closeNav() : openNav()}
      >
        <SheetContent side="left" className="p-0 w-min">
          <MegzDrawer />
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block p-0 w-min">
        <MegzDrawer />
      </div>
      <div className="w-full">
        <MegzTopBar />
        <ScrollArea className="h-[calc(100vh-4rem)] flex-grow">
          <ScrollBar className="bg-primary/20" />
          <div className="p-4">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;

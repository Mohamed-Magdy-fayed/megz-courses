import { authRouter } from "@/server/api/routers/auth";
import { createTRPCRouter } from "@/server/api/trpc";
import { usersRouter } from "./routers/users";
import { coursesRouter } from "./routers/courses";
import { materialItemsRouter } from "./routers/materialItems";
import { leadsRouter } from "./routers/lead";
import { salesOperationsRouter } from "./routers/salesOperations";
import { salesAgentsRouter } from "./routers/salesAgents";
import { ordersRouter } from "./routers/orders";
import { emailsRouter } from "./routers/emails";
import { placementTestsRouter } from "./routers/placementTests";
import { selfServeRouter } from "./routers/selfServe";
import { analyticsRouter } from "./routers/analytics";
import { chatAgentsRouter } from "./routers/chatAgents";
import { chatRouter } from "./routers/chat";
import { trainersRouter } from "./routers/trainers";
import { zoomGroupsRouter } from "./routers/zoomGroups";
import { evaluationFormRouter } from "./routers/evaluationForm";
import { evaluationFormSubmissionsRouter } from "./routers/evaluationFormSubmissions";
import { waitingListRouter } from "./routers/waitingList";
import { zoomMeetingsRouter } from "./routers/zoomMeetings";
import { zoomAccountsRouter } from "@/server/api/routers/zoomAccounts";
import { notesRouter } from "@/server/api/routers/notes";
import { googleAccountsRouter } from "@/server/api/routers/googleAccounts";
import { certificatesRouter } from "@/server/api/routers/certificates";
import { levelsRouter } from "@/server/api/routers/levels";
import { siteIdentityRouter } from "@/server/api/routers/siteIdentity";
import { metaAccountRouter } from "@/server/api/routers/metaAccount";
import { setupRouter } from "@/server/api/routers/setup";
import { ticketsRouter } from "@/server/api/routers/tickets";
import { leadStagesRouter } from "@/server/api/routers/leadStages";
import { leadLabelsRouter } from "@/server/api/routers/leadLabels";
import { leadNotesRouter } from "@/server/api/routers/leadNotes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  courses: coursesRouter,
  levels: levelsRouter,
  materials: materialItemsRouter,
  leads: leadsRouter,
  leadStages: leadStagesRouter,
  leadLabels: leadLabelsRouter,
  leadNotes: leadNotesRouter,
  salesOperations: salesOperationsRouter,
  salesAgents: salesAgentsRouter,
  orders: ordersRouter,
  emails: emailsRouter,
  placementTests: placementTestsRouter,
  selfServe: selfServeRouter,
  analytics: analyticsRouter,
  chatAgents: chatAgentsRouter,
  chat: chatRouter,
  trainers: trainersRouter,
  zoomGroups: zoomGroupsRouter,
  evaluationForm: evaluationFormRouter,
  evaluationFormSubmissions: evaluationFormSubmissionsRouter,
  waitingList: waitingListRouter,
  zoomMeetings: zoomMeetingsRouter,
  zoomAccounts: zoomAccountsRouter,
  googleAccounts: googleAccountsRouter,
  metaAccount: metaAccountRouter,
  notes: notesRouter,
  certificates: certificatesRouter,
  siteIdentity: siteIdentityRouter,
  setup: setupRouter,
  tickets: ticketsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

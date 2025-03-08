import { analyticsRouter } from "@/server/api/routers/admin/dashboard/analytics";
import { chatRouter } from "@/server/api/routers/admin/operationsManagement/chat";
import { notesRouter } from "@/server/api/routers/admin/operationsManagement/notes";
import { placementTestsRouter } from "@/server/api/routers/admin/operationsManagement/placementTests";
import { ticketsRouter } from "@/server/api/routers/admin/operationsManagement/tickets";
import { traineeListRouter } from "@/server/api/routers/admin/operationsManagement/traineeList";
import { waitingListRouter } from "@/server/api/routers/admin/operationsManagement/waitingList";
import { zoomGroupsRouter } from "@/server/api/routers/admin/operationsManagement/zoomGroups";
import { zoomMeetingsRouter } from "@/server/api/routers/admin/operationsManagement/zoomMeetings";
import { zoomSessionsRouter } from "@/server/api/routers/admin/operationsManagement/zoomSessions";
import { leadsRouter } from "@/server/api/routers/admin/salesManagement/lead";
import { leadInteractionsRouter } from "@/server/api/routers/admin/salesManagement/leadInteractions";
import { leadLabelsRouter } from "@/server/api/routers/admin/salesManagement/leadLabels";
import { leadNotesRouter } from "@/server/api/routers/admin/salesManagement/leadNotes";
import { leadStagesRouter } from "@/server/api/routers/admin/salesManagement/leadStages";
import { ordersRouter } from "@/server/api/routers/admin/salesManagement/orders";
import { paymentsRouter } from "@/server/api/routers/admin/salesManagement/payments";
import { refundsRouter } from "@/server/api/routers/admin/salesManagement/refunds";
import { googleAccountsRouter } from "@/server/api/routers/admin/systemManagement/configuration/googleAccounts";
import { metaAccountRouter } from "@/server/api/routers/admin/systemManagement/configuration/metaAccount";
import { paramsRouter } from "@/server/api/routers/admin/systemManagement/configuration/params";
import { setupRouter } from "@/server/api/routers/admin/systemManagement/configuration/setup";
import { siteIdentityRouter } from "@/server/api/routers/admin/systemManagement/configuration/siteIdentity";
import { whatsAppTemplatesRouter } from "@/server/api/routers/admin/systemManagement/configuration/whatsAppTemplates";
import { zoomAccountsRouter } from "@/server/api/routers/admin/systemManagement/configuration/zoomAccounts";
import { coursesRouter } from "@/server/api/routers/admin/systemManagement/content/courses";
import { levelsRouter } from "@/server/api/routers/admin/systemManagement/content/levels";
import { materialItemsRouter } from "@/server/api/routers/admin/systemManagement/content/materialItems";
import { productItemsRouter } from "@/server/api/routers/admin/systemManagement/content/productItems";
import { productsRouter } from "@/server/api/routers/admin/systemManagement/content/products";
import { systemFormsRouter } from "@/server/api/routers/admin/systemManagement/content/systemForms";
import { chatAgentsRouter } from "@/server/api/routers/admin/usersManagement/chatAgents";
import { salesAgentsRouter } from "@/server/api/routers/admin/usersManagement/salesAgents";
import { trainersRouter } from "@/server/api/routers/admin/usersManagement/trainers";
import { usersRouter } from "@/server/api/routers/admin/usersManagement/users";
import { authRouter } from "@/server/api/routers/general/auth";
import { emailsRouter } from "@/server/api/routers/general/emails";
import { certificatesRouter } from "@/server/api/routers/student/certificates";
import { selfServeRouter } from "@/server/api/routers/student/selfServe";
import { systemFormSubmissionsRouter } from "@/server/api/routers/student/systemFormSubmissions";
import { createTRPCRouter } from "@/server/api/trpc";

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
  zoomSessions: zoomSessionsRouter,
  systemFormSubmissions: systemFormSubmissionsRouter,
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
  whatsAppTemplates: whatsAppTemplatesRouter,
  leadInteractions: leadInteractionsRouter,
  params: paramsRouter,
  systemForms: systemFormsRouter,
  traineeList: traineeListRouter,
  products: productsRouter,
  productItems: productItemsRouter,
  payments: paymentsRouter,
  refunds: refundsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { authRouter } from "@/server/api/routers/auth";
import { createTRPCRouter } from "@/server/api/trpc";
import { usersRouter } from "./routers/users";
import { coursesRouter } from "./routers/courses";
import { materialItemsRouter } from "./routers/materialItems";
import { potintialCustomerRouter } from "./routers/potintialCustomer";
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

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  courses: coursesRouter,
  materials: materialItemsRouter,
  potintialCustomers: potintialCustomerRouter,
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
});

// export type definition of API
export type AppRouter = typeof appRouter;

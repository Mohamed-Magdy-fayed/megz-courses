import { authRouter } from "@/server/api/routers/auth";
import { createTRPCRouter } from "@/server/api/trpc";
import { usersRouter } from "./routers/users";
import { coursesRouter } from "./routers/courses";
import { levelsRouter } from "./routers/levels";
import { lessonsRouter } from "./routers/lessons";
import { materialItemsRouter } from "./routers/materialItems";
import { potintialCustomerRouter } from "./routers/potintialCustomer";
import { salesOperationsRouter } from "./routers/salesOperations";
import { salesAgentsRouter } from "./routers/salesAgents";
import { ordersRouter } from "./routers/orders";
import { commsRouter } from "./routers/whatsapp";
import { placementTestsRouter } from "./routers/placementTests";
import { selfServeRouter } from "./routers/selfServe";
import { analyticsRouter } from "./routers/analytics";
import { chatAgentsRouter } from "./routers/chatAgents";
import { chatRouter } from "./routers/chat";
import { trainersRouter } from "./routers/trainers";
import { imagesRouter } from "./routers/images";

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
  lessons: lessonsRouter,
  materials: materialItemsRouter,
  potintialCustomers: potintialCustomerRouter,
  salesOperations: salesOperationsRouter,
  salesAgents: salesAgentsRouter,
  orders: ordersRouter,
  comms: commsRouter,
  placementTests: placementTestsRouter,
  selfServe: selfServeRouter,
  analytics: analyticsRouter,
  chatAgents: chatAgentsRouter,
  chat: chatRouter,
  trainers: trainersRouter,
  images: imagesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

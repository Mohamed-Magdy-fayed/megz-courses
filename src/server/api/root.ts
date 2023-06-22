import { authRouter } from "@/server/api/routers/auth";
import { createTRPCRouter } from "@/server/api/trpc";
import { studentsRouter } from "./routers/students";
import { accountRouter } from "./routers/account";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  students: studentsRouter,
  account: accountRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { authRouter } from "@/server/api/routers/auth";
import { createTRPCRouter } from "@/server/api/trpc";
import { usersRouter } from "./routers/users";
import { coursesRouter } from "./routers/courses";
import { levelsRouter } from "./routers/levels";
import { lessonsRouter } from "./routers/lessons";
import { materialItemsRouter } from "./routers/materialItems";

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
});

// export type definition of API
export type AppRouter = typeof appRouter;

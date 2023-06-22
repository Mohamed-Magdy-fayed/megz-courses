import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const accountRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
        include: { address: true },
      });

      return { user };
    }),
  getByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().optional(),
      })
    )
    .query(async ({ input: { email }, ctx }) => {
      if (!email) return { error: "no email" };

      const user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
        include: { address: true },
      });

      return { user };
    }),
});

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  getSources: protectedProcedure
    .query(async ({ ctx }) => {
      const data = await ctx.prisma.user.findMany({
        where: { NOT: { userRoles: { has: "Admin" } } },
        select: {
          device: true
        }
      })

      return {
        data,
      };
    }),
});

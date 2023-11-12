import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";



export const analyticsRouter = createTRPCRouter({
  getSources: protectedProcedure
    .query(async ({ ctx }) => {
      const data = await ctx.prisma.user.findMany({
        select: {
          device: true
        }
      })
      return {
        data,
      };
    }),
});

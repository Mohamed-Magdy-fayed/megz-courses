import { SiteIdentityFormSchema } from "@/components/siteIdentity/SiteIdentityForm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const siteIdentityRouter = createTRPCRouter({
  getSiteIdentity: publicProcedure
    .query(async ({ ctx }) => {
      let siteIdentity = await ctx.prisma.siteIdentity.findFirst()

      if (!siteIdentity) siteIdentity = await ctx.prisma.siteIdentity.create({ data: {} })

      return {
        siteIdentity,
      };
    }),
  updateSiteIdentity: protectedProcedure
    .input(SiteIdentityFormSchema)
    .mutation(async ({ ctx, input }) => {
      const siteIdentity = await ctx.prisma.siteIdentity.updateMany({
        data: input,
      })

      return {
        siteIdentity,
      };
    }),
});

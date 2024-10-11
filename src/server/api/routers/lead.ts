import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";

export const leadsRouter = createTRPCRouter({
    getCustomers: protectedProcedure
        .query(async ({ ctx }) => {
            const potintialCustomers = await ctx.prisma.lead.findMany();

            return { potintialCustomers };
        }),
});

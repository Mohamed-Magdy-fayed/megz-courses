import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "@/server/api/trpc";

export const potintialCustomerRouter = createTRPCRouter({
    getCustomers: protectedProcedure
        .query(async ({ ctx }) => {
            const potintialCustomers = await ctx.prisma.potintialCustomer.findMany();

            return { potintialCustomers };
        }),
});

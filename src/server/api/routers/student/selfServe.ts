import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { enrollHandler, enrollmentInput } from "@/server/actions/selfService/enrollmentActions";

export const selfServeRouter = createTRPCRouter({
    enrollCourse: publicProcedure
        .input(enrollmentInput)
        .mutation(async ({ input, ctx }) => {
            return enrollHandler({ input, ctx });
        }),
});

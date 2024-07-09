import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CoursStatus } from "@prisma/client";
import { validCourseLevels } from "@/lib/enumsTypes";

export const waitingListRouter = createTRPCRouter({
    addToWaitingList: protectedProcedure
        .input(z.object({
            courseId: z.string(),
            userId: z.string(),
            level: z.enum(validCourseLevels),
        }))
        .mutation(async ({ input: { userId, level, courseId }, ctx }) => {
            const user = await ctx.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found!" })

            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "course not found!" })

            const newStatuses: CoursStatus[] = [{ courseId, state: "waiting", level, }]

            const updatedUser = await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    courseStatus: {
                        set: [...user.courseStatus, ...newStatuses]
                    }
                },
            });

            return { updatedUser, course, level };
        }),
});

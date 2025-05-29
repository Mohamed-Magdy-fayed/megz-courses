import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { placementResultComms } from "@/server/actions/emails";
import { formatUserForComms } from "@/lib/fcmhelpers"

export const waitingListRouter = createTRPCRouter({
    addToWaitingList: protectedProcedure
        .input(z.object({
            courseId: z.string(),
            userId: z.string(),
            levelId: z.string(),
            oralFeedback: z.string(),
        }))
        .mutation(async ({ input: { userId, levelId, courseId, oralFeedback }, ctx }) => {
            const [placementTest, courseStatusList] = await ctx.prisma.$transaction([
                ctx.prisma.placementTest.findFirst({
                    where: { courseId, studentUserId: userId },
                }),
                ctx.prisma.courseStatus.findMany({
                    where: { userId },
                    include: { level: true },
                }),
            ]);

            // If placementTest exists, check permission, else skip
            if (placementTest && !hasPermission(ctx.session.user, "placementTests", "update", placementTest)) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You can't take that action!" });
            }

            const existingStatus = courseStatusList.find(
                s => s.courseId === courseId && s.courseLevelId === levelId
            );
            if (existingStatus) {
                throw new TRPCError({ code: "BAD_REQUEST", message: `Result submitted already! ${existingStatus.status}` });
            }

            const unassignedStatus = courseStatusList.find(
                s => s.courseId === courseId && !s.courseLevelId && ["PlacementTest", "OrderPaid"].includes(s.status)
            );
            if (!unassignedStatus) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "No courses status found!" });
            }

            const [user, course, level] = await ctx.prisma.$transaction([
                ctx.prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, email: true, phone: true, fcmTokens: true },
                }),
                ctx.prisma.course.findUnique({
                    where: { id: courseId },
                    select: { id: true, name: true, slug: true },
                }),
                ctx.prisma.courseLevel.findUnique({
                    where: { id: levelId },
                    select: { name: true },
                }),
            ]);

            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "User not found!" });
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" });
            if (!level) throw new TRPCError({ code: "BAD_REQUEST", message: "Level not found!" });

            const levelName = level.name;

            // Build the transaction array
            const transactionArray: any[] = [
                ctx.prisma.courseStatus.update({
                    where: { id: unassignedStatus.id },
                    data: {
                        status: "Waiting",
                        courseLevelId: levelId,
                    },
                }),
                ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Student added to Waiting list by ${ctx.session.user.name}`,
                        type: "Info",
                        createdForStudent: { connect: { id: user.id } },
                        createdByUser: { connect: { id: ctx.session.user.id } },
                        messages: [{
                            message: `User was added to Waiting list of course ${course.name} at level ${levelName}`,
                            updatedAt: new Date(),
                            updatedBy: "System",
                        }],
                    },
                }),
            ];

            // Only update placementTest if it exists
            if (placementTest) {
                transactionArray.push(
                    ctx.prisma.placementTest.update({
                        where: { id: placementTest.id },
                        data: { oralFeedback },
                    })
                );
            }

            await ctx.prisma.$transaction(transactionArray);

            await placementResultComms({
                courseSlug: course.slug,
                courseName: course.name,
                levelName,
                ...formatUserForComms(user),
            });

            return { user, course };
        }),
});

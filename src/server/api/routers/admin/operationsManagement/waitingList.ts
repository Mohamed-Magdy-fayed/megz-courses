import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { placementResultComms } from "@/server/actions/emails";
import { formatUserForComms } from "@/lib/fcmhelpers"
import { Prisma, PrismaClient } from "@prisma/client";

async function getAllocationPreview({
    ctx,
    userId,
    courseId,
    levelId,
}: {
    ctx: { prisma: PrismaClient };
    userId: string;
    courseId: string;
    levelId: string;
}) {
    const [course, latestOrder] = await ctx.prisma.$transaction([
        ctx.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                levels: {
                    orderBy: [{ levelOrder: "asc" }, { createdAt: "asc" }],
                    select: { id: true, name: true, slug: true },
                },
            },
        }),
        ctx.prisma.order.findFirst({
            where: {
                userId,
                status: { in: ["Pending", "Paid"] },
                product: { productItems: { some: { courseId } } },
            },
            include: {
                product: { include: { productItems: { where: { courseId }, select: { levelsCount: true } } } },
            },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    if (!course) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" });
    }

    const purchasedLevelsCount = latestOrder?.product.productItems[0]?.levelsCount;
    if (!purchasedLevelsCount || purchasedLevelsCount < 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No package levels count found for this student and course!" });
    }

    const startIndex = course.levels.findIndex((level: { id: string }) => level.id === levelId);
    if (startIndex === -1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Start level is not part of this course!" });
    }

    const resolvedLevels = course.levels.slice(startIndex, startIndex + purchasedLevelsCount);
    if (resolvedLevels.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No levels available from the selected start level!" });
    }

    const allocatableLevelsCount = resolvedLevels.length;
    const missingLevelsCount = Math.max(0, purchasedLevelsCount - allocatableLevelsCount);

    return {
        course,
        purchasedLevelsCount,
        resolvedLevels,
        allocatableLevelsCount,
        missingLevelsCount,
    };
}

export const waitingListRouter = createTRPCRouter({
    getPlacementAllocationPreview: protectedProcedure
        .input(z.object({
            courseId: z.string(),
            userId: z.string(),
            levelId: z.string(),
        }))
        .query(async ({ input, ctx }) => {
            const allocation = await getAllocationPreview({ ctx, ...input });

            return {
                purchasedLevelsCount: allocation.purchasedLevelsCount,
                allocatableLevelsCount: allocation.allocatableLevelsCount,
                missingLevelsCount: allocation.missingLevelsCount,
                resolvedLevelNames: allocation.resolvedLevels.map((level: { name: string }) => level.name),
                isPartialAllocation: allocation.missingLevelsCount > 0,
            };
        }),
    addToWaitingList: protectedProcedure
        .input(z.object({
            courseId: z.string(),
            userId: z.string(),
            levelId: z.string(),
            oralFeedback: z.string(),
            acceptPartialAllocation: z.boolean().optional(),
        }))
        .mutation(async ({ input: { userId, levelId, courseId, oralFeedback, acceptPartialAllocation }, ctx }) => {
            const [placementTest, courseStatusList] = await ctx.prisma.$transaction([
                ctx.prisma.placementTest.findFirst({
                    where: { courseId, studentUserId: userId },
                }),
                ctx.prisma.courseStatus.findMany({
                    where: { userId, courseId },
                    include: { level: true },
                }),
            ]);

            // If placementTest exists, check permission, else skip
            if (placementTest && !hasPermission(ctx.session.user, "placementTests", "update", placementTest)) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You can't take that action!" });
            }

            const allocation = await getAllocationPreview({ ctx, userId, courseId, levelId });
            const course = allocation.course;
            const levelsCount = allocation.purchasedLevelsCount;
            const resolvedLevels = allocation.resolvedLevels;
            if (allocation.missingLevelsCount > 0 && !acceptPartialAllocation) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Partial allocation detected: student purchased ${levelsCount} levels but only ${allocation.allocatableLevelsCount} are available from the selected start level. Please confirm partial allocation before submitting.`,
                });
            }

            const firstResolvedLevel = resolvedLevels[0];
            if (!firstResolvedLevel) throw new TRPCError({ code: "BAD_REQUEST", message: "No levels found for allocation!" });

            const existingFirstLevelStatus = courseStatusList.find(s => s.courseLevelId === firstResolvedLevel.id);
            const hasBlockingFirstLevelStatus = existingFirstLevelStatus && !["PlacementTest", "OrderPaid"].includes(existingFirstLevelStatus.status);
            if (hasBlockingFirstLevelStatus) {
                throw new TRPCError({ code: "BAD_REQUEST", message: `Result submitted already! ${existingFirstLevelStatus.status}` });
            }

            const unassignedStatus = courseStatusList.find(
                s => !s.courseLevelId && ["PlacementTest", "OrderPaid"].includes(s.status)
            );

            const sourceStatus = existingFirstLevelStatus ?? unassignedStatus;
            if (!sourceStatus) throw new TRPCError({ code: "BAD_REQUEST", message: "No base course status found to allocate levels!" });

            const [user, level] = await ctx.prisma.$transaction([
                ctx.prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, email: true, phone: true, fcmTokens: true },
                }),
                ctx.prisma.courseLevel.findUnique({
                    where: { id: firstResolvedLevel.id },
                    select: { name: true },
                }),
            ]);

            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "User not found!" });
            if (!level) throw new TRPCError({ code: "BAD_REQUEST", message: "Level not found!" });

            const levelName = level.name;

            // Build the transaction array
            const transactionArray: Prisma.PrismaPromise<unknown>[] = [
                existingFirstLevelStatus
                    ? ctx.prisma.courseStatus.update({
                        where: { id: existingFirstLevelStatus.id },
                        data: {
                            status: "Waiting",
                            courseLevelId: firstResolvedLevel.id,
                        },
                    })
                    : ctx.prisma.courseStatus.update({
                        where: { id: unassignedStatus!.id },
                        data: {
                            status: "Waiting",
                            courseLevelId: firstResolvedLevel.id,
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
                            message: `User was added to Waiting list of course ${course.name} at level ${levelName} with package size ${levelsCount} levels.`,
                            updatedAt: new Date(),
                            updatedBy: "System",
                        }],
                    },
                }),
            ];

            // Remaining entitled levels are created/kept as PlacementTest.
            for (const nextLevel of resolvedLevels.slice(1)) {
                const existing = courseStatusList.find(s => s.courseLevelId === nextLevel.id);

                if (!existing) {
                    transactionArray.push(
                        ctx.prisma.courseStatus.create({
                            data: {
                                status: "PlacementTest",
                                isPrivate: sourceStatus.isPrivate,
                                course: { connect: { id: courseId } },
                                user: { connect: { id: userId } },
                                order: { connect: { id: sourceStatus.orderId } },
                                level: { connect: { id: nextLevel.id } },
                            },
                        })
                    );
                } else if (existing.status === "OrderPaid") {
                    transactionArray.push(
                        ctx.prisma.courseStatus.update({
                            where: { id: existing.id },
                            data: { status: "PlacementTest" },
                        })
                    );
                }
            }

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

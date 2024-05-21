import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { SessionStatus } from "@prisma/client";
import { validGroupStatuses } from "@/lib/enumsTypes";
import { generateGroupNumnber } from "@/lib/utils";

export const zoomGroupsRouter = createTRPCRouter({
    getzoomGroups: protectedProcedure
        .input(z.object({
            ids: z.array(z.string())
        }).optional())
        .query(async ({ ctx, input }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({
                where: { id: { in: input?.ids } },
                orderBy: { createdAt: "desc" },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: {
                        include: { user: true }
                    },
                },
            });

            return { zoomGroups };
        }),
    getZoomGroupById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const zoomGroup = await ctx.prisma.zoomGroup.findUnique({
                where: { id },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: true,
                },
            });
            return { zoomGroup };
        }),
    createZoomGroup: protectedProcedure
        .input(
            z.object({
                startDate: z.date(),
                studentIds: z.array(z.string()),
                trainerId: z.string(),
                courseId: z.string(),
            })
        )
        .mutation(async ({ input: { courseId, startDate, studentIds, trainerId }, ctx }) => {
            type ZoomSession = {
                sessionDate: Date,
                sessionLink: string,
                sessionStatus: SessionStatus,
                attenders: string[],
            }

            const generateZoomSessions = async (startDate: Date): Promise<ZoomSession[]> => {
                const sessions: ZoomSession[] = [];
                let currentDate = new Date(startDate);

                // Determine the start day
                const startDay = currentDate.getDay();

                // Define the pairs of days
                let days;
                if (startDay === 0 || startDay === 3) { // Sunday or Wednesday
                    days = [0, 3]; // Sunday and Wednesday
                } else if (startDay === 1 || startDay === 4) { // Monday or Thursday
                    days = [1, 4]; // Monday and Thursday
                } else { // Tuesday or Saturday
                    days = [2, 5]; // Tuesday and Saturday
                }

                //` Generate 7 sessions
                while (sessions.length < 8) {
                    if (days.some((day) => day === currentDate.getDay())) {
                        sessions.push({
                            attenders: [],
                            sessionStatus: "scheduled",
                            sessionDate: currentDate,
                            sessionLink: `https://zoom.us/start/webmeeting`,
                        })
                    }

                    currentDate.setDate(currentDate.getDate() + 1)
                }

                return sessions;
            }

            const trainer = await ctx.prisma.trainer.findUnique({ where: { id: trainerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })

            if (!trainer || !course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course or trainer doesn't exist!" })

            const zoomGroup = await ctx.prisma.zoomGroup.create({
                data: {
                    startDate,
                    groupNumber: generateGroupNumnber(startDate, trainer?.user.name, course?.name),
                    groupStatus: "waiting",
                    zoomSessions: {
                        createMany: {
                            data: (await generateZoomSessions(startDate))
                        }
                    },
                    students: { connect: studentIds.map(c => ({ id: c })) },
                    trainer: { connect: { id: trainerId } },
                    course: { connect: { id: courseId } },
                },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: true,
                },
            });

            await ctx.prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: {
                    courseStatus: {
                        updateMany: {
                            where: { courseId },
                            data: { state: "ongoing" }
                        }
                    }
                }
            })

            return {
                zoomGroup,
            };
        }),
    editZoomGroup: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                startDate: z.date().optional(),
                trainerId: z.string().optional(),
                groupStatus: z.enum(validGroupStatuses).optional(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, startDate, trainerId, groupStatus },
            }) => {
                const zoomGroup = await ctx.prisma.zoomGroup.findUnique({
                    where: { id },
                    include: { course: true, students: true, trainer: { include: { user: true } } }
                })

                if (!zoomGroup) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Zoom group doesn't exist!" })

                const trainer = trainerId ? await ctx.prisma.trainer.findUnique({ where: { id: trainerId }, include: { user: true } }) : null

                const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                    where: {
                        id,
                    },
                    data: {
                        groupNumber: generateGroupNumnber(startDate || zoomGroup.startDate, trainer?.user.name || zoomGroup.trainer?.user.name!, zoomGroup.course?.name!),
                        startDate: startDate ?? undefined,
                        trainer: trainerId ? { connect: { id: trainerId } } : undefined,
                        groupStatus: groupStatus ?? undefined,
                    },
                    include: {
                        course: true,
                        trainer: { include: { user: true } },
                        students: true,
                    }
                });

                return { updatedZoomGroup };
            }
        ),
    addStudentsToZoomGroup: protectedProcedure
        .input(z.object({
            id: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { id, studentIds } }) => {
            const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id },
                data: { students: { connect: studentIds.map(id => ({ id })) } },
                include: { course: true, students: true, trainer: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const updatedUsers = await ctx.prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: {
                    courseStatus: { updateMany: { where: { courseId: updatedZoomGroup.courseId }, data: { state: "ongoing" } } }
                }
            })

            return { updatedZoomGroup, updatedUsers }
        }),
    moveStudentsToWaitingList: protectedProcedure
        .input(z.object({
            id: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { id, studentIds } }) => {
            const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id },
                data: {
                    students: {
                        disconnect: studentIds.map(id => ({ id })),
                    }
                },
                include: { course: true, students: true, trainer: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const updatedUsers = await ctx.prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: {
                    courseStatus: { updateMany: { where: { courseId: updatedZoomGroup.courseId }, data: { state: "waiting" } } }
                }
            })

            return { updatedZoomGroup, updatedUsers }
        }),
    moveStudentsToAnotherGroup: protectedProcedure
        .input(z.object({
            originalGroupId: z.string(),
            newGroupId: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { originalGroupId, newGroupId, studentIds } }) => {
            const studentIdsForPrisma = studentIds.map(id => ({ id }))

            const updatedOriginalZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id: originalGroupId },
                data: {
                    students: { disconnect: studentIdsForPrisma }
                },
                include: { course: true, students: true, trainer: { include: { user: true } } }
            })

            const updatedNewZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id: newGroupId },
                data: {
                    students: { connect: studentIdsForPrisma }
                },
                include: { course: true, students: true, trainer: { include: { user: true } } }
            })

            return { updatedOriginalZoomGroup, updatedNewZoomGroup }
        }),
    refundedStudentToDelete: protectedProcedure
        .input(z.object({
            id: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { id, studentIds } }) => {
            const studentIdsForPrisma = studentIds.map(id => ({ id }))

            const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id },
                data: {
                    students: { disconnect: studentIdsForPrisma }
                },
                include: { course: true, students: true, trainer: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const updatedUsers = await ctx.prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: {
                    courseStatus: { updateMany: { where: { courseId: updatedZoomGroup.courseId }, data: { state: "refunded" } } }
                }
            })

            return { updatedZoomGroup, updatedUsers }
        }),
    moveStudentToPostpondedList: protectedProcedure
        .input(z.object({
            id: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { id, studentIds } }) => {
            const studentIdsForPrisma = studentIds.map(id => ({ id }))

            const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id },
                data: {
                    students: { disconnect: studentIdsForPrisma }
                },
                include: { course: true, students: true, trainer: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const updatedUsers = await ctx.prisma.user.updateMany({
                where: { id: { in: studentIds } },
                data: {
                    courseStatus: { updateMany: { where: { courseId: updatedZoomGroup.courseId }, data: { state: "postponded" } } }
                }
            })

            return { updatedZoomGroup, updatedUsers }
        }),
    deleteZoomGroup: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedzoomGroups = await ctx.prisma.zoomGroup.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedzoomGroups };
        }),
});

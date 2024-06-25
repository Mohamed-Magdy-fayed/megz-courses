import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Course, MaterialItem, SessionStatus } from "@prisma/client";
import { validGroupStatuses } from "@/lib/enumsTypes";
import { generateGroupNumnber } from "@/lib/utils";
import { subHours } from "date-fns";

export const zoomGroupsRouter = createTRPCRouter({
    setSessionAttendance: protectedProcedure
        .input(z.object({
            sessionId: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { sessionId, studentIds } }) => {
            const updatedSession = await ctx.prisma.zoomSession.update({
                where: { id: sessionId },
                data: {
                    attenders: studentIds
                }
            })

            return { updatedSession }
        }),
    zoomGroupsCronJob: protectedProcedure
        .mutation(async ({ ctx }) => {
            const currentDate = new Date()
            const twoHoursAgo = subHours(currentDate, 2);

            const ongoingGroups = await ctx.prisma.zoomGroup.updateMany({
                where: {
                    AND: {
                        zoomSessions: {
                            some: { sessionStatus: { in: ["ongoing", "completedOnTime", "completedOffTime"] } }
                        },
                        groupStatus: "waiting",
                    }
                },
                data: {
                    groupStatus: "active",
                }
            })

            const completedGroups = ctx.prisma.zoomGroup.updateMany({
                where: {
                    AND: {
                        zoomSessions: {
                            every: {
                                sessionStatus: {
                                    in: ["completedOffTime", "completedOnTime"]
                                }
                            },
                        },
                        groupStatus: "active"
                    }
                },
                data: {
                    groupStatus: "completed"
                }
            })

            const ongoingSessions = await ctx.prisma.zoomSession.updateMany({
                where: {
                    AND: {
                        sessionStatus: "scheduled",
                        sessionDate: {
                            lte: currentDate
                        }
                    }
                },
                data: {
                    sessionStatus: "ongoing"
                }
            })

            const completedSessions = await ctx.prisma.zoomSession.updateMany({
                where: {
                    AND: {
                        sessionStatus: {
                            in: ["ongoing", "scheduled"]
                        },
                        sessionDate: {
                            lte: twoHoursAgo
                        }
                    }
                },
                data: {
                    sessionStatus: "completedOnTime"
                }
            })

            return {
                ongoingGroups,
                completedGroups,
                ongoingSessions,
                completedSessions,
            };
        }),
    getzoomGroups: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()).optional(),
            courseId: z.string().optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({
                where: {
                    OR: input ? {
                        id: { in: input.ids },
                        courseId: input.courseId,
                    } : undefined,
                },
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
                    zoomSessions: {
                        include: {
                            assignments: { include: { student: true } },
                            quizzes: { include: { student: true } },
                            materialItem: true,
                        },
                        orderBy: {
                            sessionDate: "asc"
                        }
                    },
                    students: true,
                    trainer: { include: { user: true } },
                },
            });
            return { zoomGroup };
        }),
    getZoomGroupStudents: protectedProcedure
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

            const gorupStudents = await ctx.prisma.user.findMany({
                where: { id: { in: zoomGroup?.studentIds } }
            })

            return { gorupStudents };
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
                materialItemId: string,
            }

            const generateZoomSessions = async (startDate: Date, course: Course & { materialItems: MaterialItem[] }): Promise<ZoomSession[]> => {
                const sessions: ZoomSession[] = [];
                let currentDate = new Date(startDate)

                // Determine the start day
                const startDay = currentDate.getDay();

                // Define the pairs of days
                let days;
                if (startDay === 0 || startDay === 3) { // Sunday or Wednesday
                    days = [0, 3]; // Sunday and Wednesday
                } else if (startDay === 1 || startDay === 4) { // Monday or Thursday
                    days = [1, 4]; // Monday and Thursday
                } else { // Tuesday or Saturday
                    days = [2, 6]; // Tuesday and Saturday
                }

                //` Generate sessions
                for (let index = 0; index < course.materialItems.length; index++) {
                    const materialItem = course.materialItems[index];
                    while (!sessions[index]) {
                        if (days.some((day) => day === currentDate.getDay())) {
                            sessions.push({
                                attenders: [],
                                sessionStatus: "scheduled",
                                sessionDate: new Date(currentDate),
                                sessionLink: `https://zoom.us/start/webmeeting`,
                                materialItemId: materialItem?.id!,
                            })
                        }
                        currentDate.setDate(currentDate.getDate() + 1)
                    }
                }

                return sessions;
            }

            const trainer = await ctx.prisma.trainer.findUnique({ where: { id: trainerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId }, include: { materialItems: true } })

            if (!trainer || !course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course or trainer doesn't exist!" })

            const zoomGroup = await ctx.prisma.zoomGroup.create({
                data: {
                    startDate: new Date(startDate),
                    groupNumber: generateGroupNumnber(startDate, trainer?.user.name, course?.name),
                    groupStatus: "waiting",
                    zoomSessions: {
                        createMany: {
                            data: (await generateZoomSessions(startDate, course))
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
                    AND: {
                        id: {
                            in: input,
                        },
                        studentIds: { isEmpty: true },
                    }
                },
            });

            if (deletedzoomGroups.count !== input.length) throw new TRPCError({ code: "BAD_REQUEST", message: "you may need to remove all stundets before deleting a group!" })

            return { deletedzoomGroups };
        }),
});

import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CourseLevel, MaterialItem, SessionStatus } from "@prisma/client";
import { validGroupStatuses, validSessionStatuses } from "@/lib/enumsTypes";
import { generateGroupNumnber, getGroupSessionDays } from "@/lib/utils";

export const zoomGroupsRouter = createTRPCRouter({
    attendSession: protectedProcedure
        .input(z.object({
            sessionId: z.string(),
        }))
        .mutation(async ({ ctx, input: { sessionId } }) => {
            const studentType = ctx.session.user.userType
            const studentId = ctx.session.user.id

            if (studentType !== "student") return { updatedSession: null }

            const session = await ctx.prisma.zoomSession.findUnique({ where: { id: sessionId } })
            if (session?.attenders.includes(studentId)) return { updatedSession: null }

            const updatedSession = await ctx.prisma.zoomSession.update({
                where: { id: sessionId },
                data: {
                    attenders: {
                        push: studentId
                    }
                }
            })

            return { updatedSession }
        }),
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
    editSessionStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            sessionStatus: z.enum(validSessionStatuses),
        }))
        .mutation(async ({ ctx, input: { id, sessionStatus } }) => {
            const updatedSession = await ctx.prisma.zoomSession.update({
                where: {
                    id
                },
                data: {
                    sessionStatus
                },
                include: {
                    materialItem: { include: { evaluationForms: true } },
                    zoomGroup: { include: { zoomSessions: true, students: true, course: true, courseLevel: true } },
                }
            })

            const zoomGroup = updatedSession.zoomGroup
            if (!zoomGroup || !zoomGroup.courseId || !zoomGroup.courseLevelId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "didn't find the zoom group" })

            const isAllSessionsScheduled = !zoomGroup.zoomSessions.some(session => session.sessionStatus === "completed")
            if (sessionStatus === "ongoing" && isAllSessionsScheduled) {
                await ctx.prisma.zoomGroup.update({
                    where: { id: zoomGroup.id },
                    data: {
                        groupStatus: "active"
                    }
                })
                await ctx.prisma.courseStatus.updateMany({
                    where: {
                        AND: {
                            userId: { in: zoomGroup.studentIds },
                            courseId: zoomGroup.courseId,
                            courseLevelId: zoomGroup.courseLevelId,
                        }
                    },
                    data: {
                        status: "ongoing"
                    }
                })
            }

            const isAllSessionsCompleted = zoomGroup.zoomSessions.every(session => session.sessionStatus === "completed")
            if (sessionStatus === "completed" && isAllSessionsCompleted) {
                await ctx.prisma.zoomGroup.update({
                    where: { id: zoomGroup.id },
                    data: {
                        groupStatus: "completed"
                    }
                })
                await ctx.prisma.courseStatus.updateMany({
                    where: {
                        AND: {
                            userId: { in: zoomGroup.studentIds },
                            courseId: zoomGroup.courseId,
                            courseLevelId: zoomGroup.courseLevelId,
                        }
                    },
                    data: {
                        status: "completed"
                    }
                })

                await Promise.all(zoomGroup.students.map(async st => {
                    await ctx.prisma.userNote.create({
                        data: {
                            sla: 0,
                            status: "Closed",
                            title: `Student group completed and final test unlocked`,
                            type: "Info",
                            messages: [{
                                message: `Group ${zoomGroup.groupNumber} completed and the student have been granted access to the final test.`,
                                updatedAt: new Date(),
                                updatedBy: "System"
                            }],
                            createdByUser: { connect: { id: ctx.session.user.id } },
                            createdForStudent: { connect: { id: st.id } }
                        }
                    })
                }))
            }

            return { updatedSession }
        }),
    getStudentZoomGroups: protectedProcedure
        .input(z.object({
            courseSlug: z.string(),
        }))
        .query(async ({ ctx, input: { courseSlug } }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({
                where: {
                    course: { slug: courseSlug },
                    studentIds: {
                        has: ctx.session.user.id
                    },
                    groupStatus: "active",
                },
                orderBy: { createdAt: "desc" },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    trainer: {
                        include: { user: true }
                    },
                    courseLevel: true,
                },
            });

            return { zoomGroups };
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
                    courseLevel: true,
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
                    students: { include: { courseStatus: true, orders: true, } },
                    trainer: { include: { user: true } },
                    courseLevel: true,
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
                courseId: z.string(),
                trainerId: z.string(),
                zoomClientId: z.string(),
                groupNumber: z.string(),
                meetingNumber: z.string(),
                meetingPassword: z.string(),
                meetingLink: z.string(),
                courseLevelId: z.string(),
            })
        )
        .mutation(async ({ input: { startDate, studentIds, groupNumber, meetingNumber, courseId, trainerId, zoomClientId, meetingPassword, meetingLink, courseLevelId }, ctx }) => {
            if (ctx.session.user.userType !== "admin" && ctx.session.user.userType !== "salesAgent") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not allowed to take this action, Please contact your admin!" })
            type ZoomSession = {
                sessionDate: Date,
                sessionLink: string,
                sessionStatus: SessionStatus,
                attenders: string[],
                materialItemId: string,
                zoomClientId: string,
            }

            const generateZoomSessions = async (startDate: Date, level: CourseLevel & { materialItems: MaterialItem[] }, zoomClientId: string): Promise<ZoomSession[]> => {
                const sessions: ZoomSession[] = [];
                let currentDate = new Date(startDate)

                const startDay = currentDate.getDay();
                const days = getGroupSessionDays(startDay)

                for (let index = 0; index < level.materialItems.length; index++) {
                    const materialItem = level.materialItems[index];
                    while (!sessions[index]) {
                        if (days.some((day) => day === currentDate.getDay())) {
                            sessions.push({
                                attenders: [],
                                sessionStatus: "scheduled",
                                sessionDate: new Date(currentDate),
                                sessionLink: meetingLink,
                                materialItemId: materialItem?.id!,
                                zoomClientId,
                            })
                        }
                        currentDate.setDate(currentDate.getDate() + 1)
                    }
                }

                return sessions;
            }

            const course = await ctx.prisma.course.findUnique({ where: { id: courseId }, include: { levels: { include: { materialItems: true } } } })
            if (!course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course doesn't exist!" })

            const level = course.levels.find(({ id }) => id === courseLevelId)
            if (!level) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No levels!" })
            if (level.materialItems.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No materials in this level!" })

            const zoomGroup = await ctx.prisma.zoomGroup.create({
                data: {
                    startDate: new Date(startDate),
                    meetingNumber,
                    meetingPassword,
                    groupNumber,
                    groupStatus: "waiting",
                    zoomSessions: {
                        createMany: {
                            data: (await generateZoomSessions(startDate, level, zoomClientId))
                        }
                    },
                    students: { connect: studentIds.map(c => ({ id: c })) },
                    trainer: { connect: { id: trainerId } },
                    course: { connect: { id: courseId } },
                    courseLevel: { connect: { id: courseLevelId } },
                },
                include: {
                    course: true,
                    zoomSessions: { include: { materialItem: true, zoomClient: true } },
                    students: true,
                    trainer: { include: { user: true } },
                },
            });

            await ctx.prisma.courseStatus.updateMany({
                where: { userId: { in: studentIds }, courseId },
                data: {
                    status: "ongoing",
                }
            })

            await Promise.all(zoomGroup.students.map(async (student) => {
                await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Zoom Group Created for the student`,
                        type: "Info",
                        createdForStudent: { connect: { id: student.id } },
                        messages: [{
                            message: `The student was added to a zoom group ${zoomGroup.groupNumber}`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                    }
                })
            }))


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

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { userId: { in: studentIds } },
                data: {
                    status: "ongoing"
                }
            })

            return { updatedZoomGroup, updatedCourseStatus }
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

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { userId: { in: studentIds } },
                data: {
                    status: "waiting",
                }
            })

            return { updatedZoomGroup, updatedCourseStatus }
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

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { userId: { in: studentIds } },
                data: {
                    status: "refunded",
                }
            })

            return { updatedZoomGroup, updatedCourseStatus }
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

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { userId: { in: studentIds } },
                data: {
                    status: "postponded",
                }
            })

            return { updatedZoomGroup, updatedCourseStatus }
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

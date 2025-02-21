import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validSessionStatuses } from "@/lib/enumsTypes";
import { format } from "date-fns";
import { EmailsWrapper } from "@/components/emails/EmailsWrapper";
import SessionUpdatedEmail from "@/components/emails/SessionUpdated";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { env } from "@/env.mjs";
import { meetingLinkConstructor } from "@/lib/meetingsHelpers";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { hasPermission } from "@/server/permissions";

export const zoomSessionsRouter = createTRPCRouter({
    attendSession: protectedProcedure
        .input(z.object({
            sessionId: z.string(),
        }))
        .mutation(async ({ ctx, input: { sessionId } }) => {
            const studentType = ctx.session.user.userRoles
            const studentId = ctx.session.user.id

            if (studentType.includes("Student")) return { updatedSession: null }

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
                    materialItem: { include: { systemForms: true } },
                    zoomGroup: { include: { zoomSessions: true, students: true, course: true, courseLevel: true } },
                }
            })

            const zoomGroup = updatedSession.zoomGroup
            if (!zoomGroup || !zoomGroup.courseId || !zoomGroup.courseLevelId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "didn't find the zoom group" })

            const isAllSessionsScheduled = !zoomGroup.zoomSessions.some(session => session.sessionStatus === "Completed")
            if (sessionStatus === "Ongoing" && isAllSessionsScheduled) {
                await ctx.prisma.zoomGroup.update({
                    where: { id: zoomGroup.id },
                    data: {
                        groupStatus: "Active"
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
                        status: "Ongoing"
                    }
                })
            }

            const isAllSessionsCompleted = zoomGroup.zoomSessions.every(session => session.sessionStatus === "Completed")
            if (sessionStatus === "Completed" && isAllSessionsCompleted) {
                await ctx.prisma.zoomGroup.update({
                    where: { id: zoomGroup.id },
                    data: {
                        groupStatus: "Completed"
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
                        status: "Completed"
                    }
                })

                await Promise.all(zoomGroup.students.map(async st => {
                    await ctx.prisma.userNote.create({
                        data: {
                            sla: 0,
                            status: "Closed",
                            title: `Student group Completed and final test unlocked`,
                            type: "Info",
                            messages: [{
                                message: `Group ${zoomGroup.groupNumber} Completed and the Student have been granted access to the final test.`,
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
    editSession: protectedProcedure
        .input(z.object({
            id: z.string(),
            sessionDate: z.date(),
            meetingNumber: z.string(),
            meetingPassword: z.string(),
            sessionStatus: z.enum(validSessionStatuses),
        }))
        .mutation(async ({ ctx, input: { id, sessionStatus, sessionDate, meetingNumber, meetingPassword } }) => {
            const originalSession = await ctx.prisma.zoomSession.findUnique({
                where: {
                    id
                }
            })
            const updatedSession = await ctx.prisma.zoomSession.update({
                where: {
                    id
                },
                data: {
                    sessionDate,
                    meetingNumber,
                    meetingPassword,
                    sessionStatus,
                },
                include: {
                    materialItem: { include: { systemForms: true } },
                    zoomGroup: { include: { zoomSessions: true, students: true, course: true, courseLevel: true } },
                }
            })

            const zoomGroup = updatedSession.zoomGroup
            if (!zoomGroup || !zoomGroup.courseId || !zoomGroup.courseLevelId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "didn't find the zoom group" })

            const isAllSessionsScheduled = !zoomGroup.zoomSessions.some(session => session.sessionStatus === "Completed")
            if (sessionStatus === "Ongoing" && isAllSessionsScheduled) {
                await ctx.prisma.zoomGroup.update({
                    where: { id: zoomGroup.id },
                    data: {
                        groupStatus: "Active"
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
                        status: "Ongoing"
                    }
                })
            }

            const isAllSessionsCompleted = zoomGroup.zoomSessions.every(session => session.sessionStatus === "Completed")
            if (sessionStatus === "Completed" && isAllSessionsCompleted) {
                await ctx.prisma.zoomGroup.update({
                    where: { id: zoomGroup.id },
                    data: {
                        groupStatus: "Completed"
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
                        status: "Completed"
                    }
                })

                await Promise.all(zoomGroup.students.map(async st => {
                    await ctx.prisma.userNote.create({
                        data: {
                            sla: 0,
                            status: "Closed",
                            title: `Student group Completed and final test unlocked`,
                            type: "Info",
                            messages: [{
                                message: `Group ${zoomGroup.groupNumber} Completed and the Student have been granted access to the final test.`,
                                updatedAt: new Date(),
                                updatedBy: "System"
                            }],
                            createdByUser: { connect: { id: ctx.session.user.id } },
                            createdForStudent: { connect: { id: st.id } }
                        }
                    })
                }))
            }

            const sessionLink = `${env.NEXTAUTH_URL}${meetingLinkConstructor({
                meetingNumber: updatedSession.zoomGroup?.meetingNumber || "",
                meetingPassword: updatedSession.zoomGroup?.meetingPassword || "",
                sessionTitle: updatedSession.materialItem?.title || "",
                sessionId: updatedSession.id,
            })}`

            if (
                updatedSession.sessionDate.getDate() !== originalSession?.sessionDate.getDate()
                && updatedSession.sessionDate.getHours() !== originalSession?.sessionDate.getHours()
                && updatedSession.sessionDate.getMinutes() !== originalSession?.sessionDate.getMinutes()
            ) {
                updatedSession.zoomGroup?.students.map(async student => {
                    const html = await EmailsWrapper({
                        EmailComp: SessionUpdatedEmail,
                        prisma: ctx.prisma,
                        props: {
                            sessionDate: format(updatedSession.sessionDate, "PPPp"),
                            sessionLink: sessionLink,
                            studentName: student.name,
                            studentEmail: student.email,
                        }
                    })

                    sendZohoEmail({ html, email: student.email, subject: "A session date has been updated" })
                    sendWhatsAppMessage({ prisma: ctx.prisma, toNumber: student.phone, type: "SessionUpdated", variables: { name: student.name, newTime: format(updatedSession?.sessionDate, "PPPp"), oldTime: format(originalSession?.sessionDate || new Date(), "PPPp"), sessionLink } })
                })
            }

            return { updatedSession }
        }),
    deleteZoomSessions: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "zoomSessions", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not allowed to take this action, Please contact your Admin!" })

            const deletedZoomSessions = await ctx.prisma.zoomSession.deleteMany({
                where: {
                    AND: {
                        id: {
                            in: input,
                        },
                    }
                },
            });

            return { deletedZoomSessions };
        }),
});

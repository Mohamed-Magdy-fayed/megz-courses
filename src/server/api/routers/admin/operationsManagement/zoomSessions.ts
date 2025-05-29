import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validSessionStatuses } from "@/lib/enumsTypes";
import { format } from "date-fns";
import { EmailsWrapper } from "@/components/general/emails/EmailsWrapper";
import SessionUpdatedEmail from "@/components/general/emails/SessionUpdated";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { hasPermission } from "@/server/permissions";
import { handleSessionStatusUpdate } from "@/server/actions/zoomSessions/sessionsActions";

export const zoomSessionsRouter = createTRPCRouter({
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input: { id } }) => {
            return await ctx.prisma.zoomSession.findUnique({
                where: { id },
                include: { materialItem: true },
            })
        }),
    getAllSessions: protectedProcedure
        .query(async ({ ctx }) => {
            const sessions = await ctx.prisma.zoomSession.findMany({
                orderBy: { sessionDate: "desc" },
                include: {
                    zoomGroup: { include: { teacher: { include: { user: true } } } },
                    materialItem: true,
                    zoomClient: true,
                    placementTest: { include: { tester: { include: { user: true } }, student: true, course: true } },
                }
            })

            return { sessions };
        }),
    getAllUpcomingSessions: protectedProcedure
        .query(async ({ ctx }) => {
            const sessions = await ctx.prisma.zoomSession.findMany({
                where: { sessionDate: { gte: new Date() } },
                orderBy: { sessionDate: "asc" },
                include: {
                    zoomGroup: { include: { teacher: { include: { user: true } } } },
                    materialItem: true,
                    zoomClient: true,
                    placementTest: { include: { tester: { include: { user: true } }, student: true, course: true } },
                }
            })

            return { sessions };
        }),
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
                    zoomClient: { select: { isZoom: true } },
                }
            })

            const zoomGroup = updatedSession.zoomGroup
            const course = updatedSession.zoomGroup?.course
            const level = updatedSession.zoomGroup?.courseLevel
            const material = updatedSession.materialItem
            if (!zoomGroup || !course || !level || !material) return { updatedSession }

            const isAllSessionsScheduled = !zoomGroup.zoomSessions.some(session => session.sessionStatus === "Completed")
            const isAllSessionsCompleted = zoomGroup.zoomSessions.every(session => session.sessionStatus === "Completed")
            const nextSession = zoomGroup.zoomSessions
                .filter(s => s.sessionDate > updatedSession.sessionDate && s.sessionStatus !== "Completed")
                .sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())[0];

            await handleSessionStatusUpdate({
                course,
                currentUserId: ctx.session.user.id,
                isAllSessionsCompleted,
                isAllSessionsScheduled,
                isZoom: !!updatedSession.zoomClient?.isZoom,
                level,
                material,
                nextSession,
                prisma: ctx.prisma,
                sessionStatus,
                students: zoomGroup.students,
                updatedSession,
                zoomGroup,
            })

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
                    zoomClient: { select: { isZoom: true } },
                }
            })

            const zoomGroup = updatedSession.zoomGroup
            const course = updatedSession.zoomGroup?.course
            const level = updatedSession.zoomGroup?.courseLevel
            const material = updatedSession.materialItem
            if (!zoomGroup || !course || !level || !material) return { updatedSession }

            const isAllSessionsScheduled = !zoomGroup.zoomSessions.some(session => session.sessionStatus === "Completed")
            const isAllSessionsCompleted = zoomGroup.zoomSessions.every(session => session.sessionStatus === "Completed")
            const nextSession = zoomGroup.zoomSessions
                .filter(s => s.sessionDate > updatedSession.sessionDate && s.sessionStatus !== "Completed")
                .sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())[0];

            await handleSessionStatusUpdate({
                course,
                currentUserId: ctx.session.user.id,
                isAllSessionsCompleted,
                isAllSessionsScheduled,
                isZoom: !!updatedSession.zoomClient?.isZoom,
                level,
                material,
                nextSession,
                prisma: ctx.prisma,
                sessionStatus,
                students: zoomGroup.students,
                updatedSession,
                zoomGroup,
            })

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
                            studentName: student.name,
                            studentEmail: student.email,
                        }
                    })

                    sendZohoEmail({ html, email: student.email, subject: "A session date has been updated" })
                    sendWhatsAppMessage({ prisma: ctx.prisma, toNumber: student.phone, type: "SessionUpdated", variables: { name: student.name, courseName: course.name, newTime: format(updatedSession?.sessionDate, "PPPp"), oldTime: format(originalSession?.sessionDate || new Date(), "PPPp") } })
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

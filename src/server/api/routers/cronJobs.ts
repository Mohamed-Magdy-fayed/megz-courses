import { preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import { sendNotification } from "@/server/actions/emails";
import { handlePlacementTestProgress, handleSessionStatusUpdate } from "@/server/actions/zoomSessions/sessionsActions";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ROOT_EMAIL } from "@/server/constants";
import { format } from "date-fns";

export const cronRouter = createTRPCRouter({
    startingSessions: publicProcedure.query(async ({ ctx }) => {
        console.log("🔔 Sending trainer reminders...");

        const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000);

        // 1. Get sessions starting soon
        const startingSoonSessions = await ctx.prisma.zoomSession.findMany({
            where: {
                sessionStatus: "Scheduled",
                sessionDate: {
                    lte: fifteenMinutesFromNow,
                    gte: new Date(),
                },
                zoomGroup: { updatedAt: { lte: new Date() } }
            },
            include: {
                materialItem: true,
                zoomGroup: {
                    include: {
                        teacher: {
                            include: {
                                user: true,
                            },
                        },
                    }
                }
            },
        });

        if (startingSoonSessions.length === 0) {
            console.log("✅ No sessions starting soon.");
            return { success: true };
        }

        // 2. Loop through sessions and notify trainers
        await Promise.all(
            startingSoonSessions.map(async (session) => {
                const trainer = session.zoomGroup?.teacher;
                const user = trainer?.user;
                if (!user || !user.fcmTokens?.length) return;

                const updatedSession = await ctx.prisma.zoomSession.update({
                    where: { id: session.id },
                    data: { sessionStatus: "Starting" },
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
                    isAllSessionsCompleted,
                    isAllSessionsScheduled,
                    isZoom: !!updatedSession.zoomClient?.isZoom,
                    level,
                    material,
                    nextSession,
                    prisma: ctx.prisma,
                    sessionStatus: session.sessionStatus,
                    students: zoomGroup.students,
                    updatedSession,
                    zoomGroup,
                })

                console.log(`🔔 Reminder sent to trainer: ${user.name}`);
            })
        );

        return { success: true };
    }),
    startingTests: publicProcedure.query(async ({ ctx }) => {
        console.log("🔔 Sending testers reminders...");

        const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000);

        // 1. Get sessions starting soon
        const startingSoonSessions = await ctx.prisma.zoomSession.findMany({
            where: {
                sessionStatus: "Scheduled",
                sessionDate: {
                    lte: fifteenMinutesFromNow,
                    gte: new Date(),
                },
                placementTest: { updatedAt: { lte: new Date() } }
            },
            include: {
                materialItem: true,
                placementTest: {
                    include: {
                        tester: {
                            include: {
                                user: true,
                            },
                        },
                    }
                }
            },
        });

        if (startingSoonSessions.length === 0) {
            console.log("✅ No tests starting soon.");
            return { success: true };
        }

        // 2. Loop through tests and notify trainers
        await Promise.all(
            startingSoonSessions.map(async (session) => {
                const trainer = session.placementTest?.tester;
                const user = trainer?.user;
                if (!user) return;

                const updatedSession = await ctx.prisma.zoomSession.update({
                    where: { id: session.id },
                    data: { sessionStatus: "Starting" },
                    include: {
                        materialItem: { include: { systemForms: true } },
                        placementTest: { include: { student: true, course: true, tester: { include: { user: true } } } },
                        zoomClient: { select: { isZoom: true } },
                    }
                })

                const placementTest = updatedSession.placementTest
                const course = placementTest?.course
                const tester = placementTest?.tester.user
                if (!placementTest || !course || !tester) return { updatedSession }

                await handlePlacementTestProgress({
                    updatedSession,
                    course,
                    tester,
                    isZoom: !!updatedSession.zoomClient?.isZoom,
                    sessionStatus: session.sessionStatus,
                    student: placementTest.student,
                })

                console.log(`🔔 Reminder sent to tester: ${user.name}`);
            })
        );

        return { success: true };
    }),
    missedSessions: publicProcedure.query(async ({ ctx }) => {
        console.log("🔔 Checking for missed sessions...");

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        // 1. Get sessions that should have started but are still marked as 'Starting'
        const missedSessions = await ctx.prisma.zoomSession.findMany({
            where: {
                sessionStatus: "Starting",
                sessionDate: { lte: fifteenMinutesAgo },
            },
            include: {
                materialItem: true,
                zoomGroup: {
                    include: {
                        teacher: {
                            include: { user: true },
                        },
                    },
                },
            },
        });

        if (missedSessions.length === 0) {
            console.log("✅ No missed sessions found.");
            return { success: true };
        }

        // 2. Optionally fetch admin to notify
        const adminAccount = await ctx.prisma.user.findFirst({
            where: {
                userRoles: { has: "Admin" },
                email: { not: ROOT_EMAIL },
            },
        });

        // 3. Process each missed session
        await Promise.all(
            missedSessions.map(async (session) => {
                const trainer = session.zoomGroup?.teacher;
                const user = trainer?.user;
                if (!user || !user.fcmTokens?.length) return;

                // 3.1 Update session status to 'Cancelled'
                await ctx.prisma.zoomSession.update({
                    where: { id: session.id },
                    data: { sessionStatus: "Cancelled" },
                });

                // 3.2 Send missed session notification to trainer
                await sendNotification({
                    tokens: user.fcmTokens,
                    title: "❌ Missed Session",
                    body: `You missed your session "${session.materialItem?.title}" scheduled at ${format(session.sessionDate, "PPpp")}.`,
                    link: preMeetingLinkConstructor({
                        isZoom: true,
                        meetingNumber: session.meetingNumber,
                        meetingPassword: session.meetingPassword,
                        sessionTitle: session.materialItem?.title ?? "Zoom Session",
                        sessionId: session.id,
                    }),
                });

                // 3.3 Send missed session notification to admin
                if (adminAccount) {
                    await sendNotification({
                        tokens: adminAccount.fcmTokens,
                        title: "❌ Missed Session",
                        body: `Teacher: ${trainer.user.name} missed a session that was scheduled at ${format(session.sessionDate, "PPp")}.`,
                        link: preMeetingLinkConstructor({
                            isZoom: true,
                            meetingNumber: session.meetingNumber,
                            meetingPassword: session.meetingPassword,
                            sessionTitle: session.materialItem?.title ?? "Zoom Session",
                            sessionId: session.id,
                        }),
                    });
                }

                console.log(`⚠️ Missed session notification sent to trainer: ${user.name}`);
            })
        );

        return { success: true };
    }),
    completedSessions: publicProcedure.query(async ({ ctx }) => {
        console.log("📦 Checking for sessions to complete...");

        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        // 1. Find sessions that started more than 2 hours ago and are still "Ongoing"
        const sessionsToComplete = await ctx.prisma.zoomSession.findMany({
            where: {
                sessionStatus: "Ongoing",
                sessionDate: { lte: sixHoursAgo },
            },
            include: {
                zoomGroup: true,
            },
        });

        if (sessionsToComplete.length === 0) {
            console.log("✅ No sessions to mark as completed.");
            return { success: true };
        }

        // 2. Update each session to "Completed"
        const updatedGroups = new Set<string>();

        await Promise.all(
            sessionsToComplete.map(async (session) => {
                const updatedSession = await ctx.prisma.zoomSession.update({
                    where: { id: session.id },
                    data: { sessionStatus: "Completed" },
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
                    isAllSessionsCompleted,
                    isAllSessionsScheduled,
                    isZoom: !!updatedSession.zoomClient?.isZoom,
                    level,
                    material,
                    nextSession,
                    prisma: ctx.prisma,
                    sessionStatus: session.sessionStatus,
                    students: zoomGroup.students,
                    updatedSession,
                    zoomGroup,
                })

                if (session.zoomGroup?.id) {
                    updatedGroups.add(session.zoomGroup?.id);
                }

                console.log(`✅ Marked session ${session.id} as completed.`);
            })
        );

        return { success: true };
    }),
    completedGroups: publicProcedure.query(async ({ ctx }) => {
        console.log("📦 Checking for groups to complete...");

        const updatedGroups = await ctx.prisma.zoomGroup.updateMany({
            where: {
                groupStatus: "Active",
                AND: {
                    zoomSessions: {
                        every: {
                            sessionStatus: "Completed",
                        },
                    },
                },
            },
            data: { groupStatus: "Completed" },
        })

        console.log(`✅ Marked ${updatedGroups.count} groups as completed.`);
        return { success: true };
    }),
});

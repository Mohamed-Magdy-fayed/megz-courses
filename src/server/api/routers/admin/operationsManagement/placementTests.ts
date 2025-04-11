import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createZoomMeeting, getAvailableZoomClient, meetingLinkConstructor, preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import { ZoomMeeting } from "@/lib/zoomTypes";
import { env } from "@/env.mjs";
import { format } from "date-fns";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { createMeeting, generateToken, getMeetingDetails, getUserRooms } from "@/lib/onMeetingApi";
import { ZoomClient } from "@prisma/client";
import { hasPermission } from "@/server/permissions";
import { placementTestScheduledComms } from "@/server/actions/emails";

export const placementTestsRouter = createTRPCRouter({
    getUserCoursePlacementTest: protectedProcedure
        .input(z.object({
            courseSlug: z.string(),
        }))
        .query(async ({ ctx, input: { courseSlug } }) => {
            const userId = ctx.session.user.id
            const placementTest = await ctx.prisma.placementTest.findFirst({
                where: {
                    AND: {
                        course: { slug: courseSlug },
                        studentUserId: userId,
                    },
                },
                include: {
                    course: true,
                    student: { include: { courseStatus: { include: { level: true, course: true } } } },
                    tester: { include: { user: true } },
                    writtenTest: { include: { submissions: true, items: true } },
                    zoomSessions: { include: { zoomClient: true } },
                }
            })

            return { placementTest }
        }),
    checkExistingPlacementTest: protectedProcedure
        .input(z.object({
            courseId: z.string(),
            userId: z.string(),
        }))
        .mutation(async ({ ctx, input: { courseId, userId } }) => {
            const oldTest = await ctx.prisma.placementTest.findFirst({
                where: {
                    course: { id: courseId },
                    student: { id: userId },
                },
                include: { zoomSessions: true }
            })

            return { oldTest }
        }),
    getAllPlacementTests: protectedProcedure
        .query(async ({ ctx }) => {
            // const courses = await ctx.prisma.course.findMany({
            //     include: {
            //         placementTests: {
            // include: {
            //     student: { include: { courseStatus: { include: { level: true } } } },
            //     tester: { include: { user: true } },
            //     course: { include: { courseStatus: true, levels: true } },
            //     writtenTest: { include: { submissions: true } },
            //     zoomSessions: { include: { zoomClient: true } },
            // }
            //         }
            //     }
            // })

            // const tests = courses
            //     .flatMap(c => c.placementTests)
            //     .filter(test => !test.course?.courseStatus.some(s => !!s.courseLevelId && s.courseId === test.course?.id && test.studentUserId === s.userId))

            return {
                tests: await ctx.prisma.placementTest.findMany({
                    include: {
                        student: { include: { courseStatus: { include: { level: true } } } },
                        tester: { include: { user: true } },
                        course: { include: { courseStatus: true, levels: true } },
                        writtenTest: { include: { submissions: true } },
                        zoomSessions: { include: { zoomClient: true } },
                    }
                })
            }
        }),
    createPlacementTest: protectedProcedure
        .input(z.object({
            testTime: z.date(),
            testerId: z.string(),
            userId: z.string(),
            courseId: z.string(),
            courseName: z.string(),
            meetingNumber: z.string(),
            meetingPassword: z.string(),
            zoomClientId: z.string(),
            evaluationFormId: z.string(),
            isZoom: z.boolean(),
        }))
        .mutation(async ({ ctx, input: { courseId, testTime, testerId, userId, meetingNumber, meetingPassword, zoomClientId, evaluationFormId } }) => {
            const placementTest = await ctx.prisma.placementTest.create({
                data: {
                    course: { connect: { id: courseId } },
                    student: { connect: { id: userId } },
                    tester: { connect: { id: testerId } },
                    createdBy: { connect: { id: ctx.session.user.id } },
                    writtenTest: { connect: { id: evaluationFormId } },
                    oralTestTime: testTime,
                    zoomSessions: {
                        create: {
                            sessionDate: testTime,
                            meetingNumber,
                            meetingPassword,
                            sessionStatus: "Scheduled",
                            zoomClient: { connect: { id: zoomClientId } },
                        }
                    },
                },
                include: { writtenTest: true, student: true, tester: { include: { user: true } } }
            })

            const courseStatus = await ctx.prisma.courseStatus.findFirst({ where: { userId, courseId }, select: { id: true } })
            if (!courseStatus) throw new TRPCError({ code: "BAD_REQUEST", message: "No course Status found to update" })
            await ctx.prisma.courseStatus.update({ where: { id: courseStatus?.id }, data: { status: "PlacementTest" } })

            return { placementTest }
        }),
    sendTestComms: protectedProcedure
        .input(z.object({
            courseSlug: z.string().min(1, 'Course slug is required'),
            studentName: z.string().min(1, 'Student name is required'),
            studentEmail: z.string().email('Invalid email address'),
            studentPhone: z.string().min(7, 'Phone number is too short'),
            testTime: z.date(),
            testerName: z.string().min(1, 'Tester name is required'),
        }))
        .mutation(async ({ input: { courseSlug, studentEmail, studentName, studentPhone, testTime, testerName } }) => {
            return await placementTestScheduledComms({ courseSlug, studentEmail, studentName, studentPhone, testerName, testTime })
        }),
    deletePlacementTest: protectedProcedure
        .input(z.object({
            ids: z.array(z.string())
        }))
        .mutation(async ({ ctx, input: { ids } }) => {
            if (!hasPermission(ctx.session.user, "placementTests", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You're not authorized to take this action!" })

            const deleted = await ctx.prisma.$transaction(
                ids.map(id => ctx.prisma.placementTest.delete({ where: { id } }))
            )

            return { deleted }
        }),
    schedulePlacementTest: protectedProcedure
        .input(z.object({
            testTime: z.date(),
            testerId: z.string(),
            courseId: z.string(),
            userId: z.string(),
        }))
        .mutation(async ({ ctx, input: { testTime, courseId, userId, testerId } }) => {
            const { zoomClient } = await getAvailableZoomClient(testTime, ctx.prisma, 30)
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No available Zoom Accounts at the selected time!" })

            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Lead not found!" })
            const student = await ctx.prisma.user.findUnique({ where: { id: userId } })
            if (!student) throw new TRPCError({ code: "BAD_REQUEST", message: "Student not found!" })

            const tester = await ctx.prisma.tester.findUnique({ where: { id: testerId }, include: { user: true } })
            if (!tester || !course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course or Tester doesn't exist!" })

            const generateTheMeeting = async ({ courseName, testTime, testerName, userEmail, zoomClient }: {
                zoomClient: ZoomClient;
                userEmail: string;
                courseName: string;
                testerName: string;
                testTime: Date;
            }) => {
                if (!zoomClient.isZoom) {
                    const token = await generateToken({ api_key: zoomClient.accessToken, api_secret: zoomClient.refreshToken })
                    if (!zoomClient.roomCode) throw new TRPCError({ code: "BAD_REQUEST", message: "Corrupted OnMeeting client, please authorize it again!" })

                    const { meeting_no } = await createMeeting({
                        token,
                        meetingData: {
                            alert: true,
                            join_before_host: true,
                            recording: true,
                            room_code: zoomClient.roomCode,
                            topic: `Placement Test for course ${courseName} ${userEmail}`
                        }
                    })

                    const { meetingNumber, password } = await getMeetingDetails({ token, meetingNo: meeting_no })

                    return { meetingNumber, meetingPassword: password }
                } else {
                    const meetingData: Partial<ZoomMeeting> = {
                        topic: `Placement Test for course ${courseName}`,
                        agenda: `Oral test with mr. ${testerName}`,
                        duration: parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME),
                        password: "abcd1234",
                        settings: {
                            auto_recording: "cloud",
                            host_video: true,
                            jbh_time: 10,
                            join_before_host: true,
                            waiting_room: false,
                        },
                        start_time: format(testTime, "yyyy-MM-dd'T'HH:mm:ss:SSS'Z'"),
                        timezone: "Africa/Cairo",
                        type: 2,
                    }

                    const { meetingNumber, meetingPassword } = await createZoomMeeting(meetingData, zoomClient.accessToken)
                    return { meetingNumber, meetingPassword }
                }
            }

            const { meetingNumber, meetingPassword } = await generateTheMeeting({
                courseName: course.name,
                testerName: tester.user.name,
                testTime,
                userEmail: student.email,
                zoomClient,
            })

            if (!meetingNumber || !meetingPassword) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "An error occured while getting the meeting number and password, please check the server logs!" })

            const meetingLink = `${env.NEXTAUTH_URL}${meetingLinkConstructor({ meetingNumber, meetingPassword, sessionTitle: `Placement Test for course ${course.name}` })}`

            await ctx.prisma.zoomClient.update({
                where: { id: zoomClient.id },
                data: {
                    zoomSessions: {
                        create: {
                            sessionDate: testTime,
                            meetingNumber,
                            meetingPassword,
                            sessionStatus: "Scheduled",
                        }
                    }
                }
            })

            const systemForm = await ctx.prisma.systemForm.findFirst({
                where: {
                    AND: {
                        courseId,
                        type: "PlacementTest"
                    }
                }
            })
            if (!systemForm) throw new TRPCError({ code: "BAD_REQUEST", message: "No Evaluation Form" })
            const evaluationFormId = systemForm.id

            const oldTest = await ctx.prisma.placementTest.findFirst({
                where: {
                    course: { id: courseId },
                    student: { id: userId },
                },
                include: { zoomSessions: true }
            })

            const notCancelledTests = oldTest?.zoomSessions.filter(s => s.sessionStatus !== "Cancelled")

            if (notCancelledTests && notCancelledTests?.length > 0) {
                await ctx.prisma.$transaction(notCancelledTests.map(s => {
                    return ctx.prisma.zoomSession.update({
                        where: { id: s.id },
                        data: { sessionStatus: "Cancelled" }
                    })
                }))
                // await deleteZoomMeeting(oldTest.oralTestMeeting.meetingNumber, zoomClient.accessToken)
            }

            const PlacementTest = oldTest
                ? await ctx.prisma.placementTest.update({
                    where: {
                        id: oldTest.id
                    },
                    data: {
                        createdBy: { connect: { id: ctx.session.user.id } },
                        // oralTestMeeting: {
                        //     zoomClientId: zoomClient.id,
                        //     meetingNumber,
                        //     meetingPassword,
                        // },
                        zoomSessions: {
                            create: {
                                sessionDate: testTime,
                                meetingNumber,
                                meetingPassword,
                                sessionStatus: "Scheduled",
                                zoomClient: { connect: { id: zoomClient.id } },
                            }
                        },
                        oralTestTime: testTime,
                    },
                    include: { writtenTest: true, student: true }
                })
                : await ctx.prisma.placementTest.create({
                    data: {
                        course: { connect: { id: courseId } },
                        student: { connect: { id: userId } },
                        tester: { connect: { id: testerId } },
                        createdBy: { connect: { id: ctx.session.user.id } },
                        writtenTest: { connect: { id: evaluationFormId } },
                        // oralTestMeeting: {
                        //     zoomClientId: zoomClient.id,
                        //     meetingNumber,
                        //     meetingPassword,
                        // },
                        zoomSessions: {
                            create: {
                                sessionDate: testTime,
                                meetingNumber,
                                meetingPassword,
                                sessionStatus: "Scheduled",
                                zoomClient: { connect: { id: zoomClient.id } },
                            }
                        },
                        oralTestTime: testTime,
                    },
                    include: { writtenTest: true, student: true }
                })

            const template = await ctx.prisma.messageTemplate.findUnique({
                where: { name: "Placement Test Scheduled" },
            })
            if (!template) throw new TRPCError({ code: "BAD_REQUEST", message: "No message template!" })

            const whatsappMessage = await sendWhatsAppMessage({
                toNumber: `${PlacementTest.student.phone}`,
                prisma: ctx.prisma,
                type: "PlacementTestScheduled",
                variables: {
                    name: PlacementTest.student.name,
                    testTime: format(testTime, "PPPp"),
                    trainerName: tester.user.name,
                    meetingLink,
                }
            })

            return { PlacementTest, oldTest, whatsappMessage };
        }),
    schedulePlacementTestWithNoLead: protectedProcedure
        .input(z.object({
            testTime: z.date(),
            testerId: z.string(),
            userId: z.string(),
            courseId: z.string(),
        }))
        .mutation(async ({ ctx, input: { testTime, testerId, courseId, userId } }) => {
            const { zoomClient } = await getAvailableZoomClient(testTime, ctx.prisma, 30)
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No available Zoom Accounts at the selected time!" })

            const tester = await ctx.prisma.tester.findUnique({ where: { id: testerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!tester || !course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course or Tester doesn't exist!" })

            const meetingData: Partial<ZoomMeeting> = {
                topic: `Placement Test for course ${course.name}`,
                agenda: `Oral test with mr. ${tester.user.name}`,
                duration: parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME),
                password: "abcd1234",
                settings: {
                    auto_recording: "cloud",
                    host_video: true,
                    jbh_time: 10,
                    join_before_host: true,
                    waiting_room: false,
                },
                start_time: format(testTime, "yyyy-MM-dd'T'HH:mm:ss:SSS'Z'"),
                timezone: "Africa/Cairo",
                type: 2,
            }
            const { meetingNumber, meetingPassword, meetingLink } = await createZoomMeeting(meetingData, zoomClient?.accessToken)

            await ctx.prisma.zoomClient.update({
                where: { id: zoomClient.id },
                data: {
                    zoomSessions: {
                        create: {
                            sessionDate: testTime,
                            meetingNumber,
                            meetingPassword,
                            sessionStatus: "Scheduled",
                        }
                    }
                }
            })

            const systemForm = await ctx.prisma.systemForm.findFirst({
                where: {
                    AND: {
                        courseId,
                        type: "PlacementTest"
                    }
                }
            })
            if (!systemForm) throw new TRPCError({ code: "BAD_REQUEST", message: "No Evaluation Form" })
            const evaluationFormId = systemForm.id

            const oldTest = await ctx.prisma.placementTest.findFirst({
                where: {
                    course: { id: courseId },
                    student: { id: userId },
                },
                include: { zoomSessions: true }
            })

            const notCancelledTests = oldTest?.zoomSessions.filter(s => s.sessionStatus !== "Cancelled")

            if (notCancelledTests && notCancelledTests.length > 0) {
                await ctx.prisma.$transaction(notCancelledTests.map(s => {
                    return ctx.prisma.zoomSession.update({
                        where: { id: s.id },
                        data: { sessionStatus: "Cancelled" }
                    })
                }))
                // await deleteZoomMeeting(oldTest.oralTestMeeting.meetingNumber, zoomClient.accessToken)
            }

            const PlacementTest = oldTest
                ? await ctx.prisma.placementTest.update({
                    where: {
                        id: oldTest.id
                    },
                    data: {
                        createdBy: { connect: { id: ctx.session.user.id } },
                        // oralTestMeeting: {
                        //     zoomClientId: zoomClient.id,
                        //     meetingNumber,
                        //     meetingPassword,
                        // },
                        zoomSessions: {
                            create: {
                                sessionDate: testTime,
                                meetingNumber,
                                meetingPassword,
                                sessionStatus: "Scheduled",
                                zoomClient: { connect: { id: zoomClient.id } },
                            }
                        },
                        oralTestTime: testTime,
                    },
                    include: { writtenTest: true, student: true }
                })
                : await ctx.prisma.placementTest.create({
                    data: {
                        course: { connect: { id: courseId } },
                        student: { connect: { id: userId } },
                        tester: { connect: { id: testerId } },
                        createdBy: { connect: { id: ctx.session.user.id } },
                        writtenTest: { connect: { id: evaluationFormId } },
                        // oralTestMeeting: {
                        //     zoomClientId: zoomClient.id,
                        //     meetingNumber,
                        //     meetingPassword,
                        // },
                        zoomSessions: {
                            create: {
                                sessionDate: testTime,
                                meetingNumber,
                                meetingPassword,
                                sessionStatus: "Scheduled",
                                zoomClient: { connect: { id: zoomClient.id } },
                            }
                        },
                        oralTestTime: testTime,
                    },
                    include: { writtenTest: true, student: true }
                })

            const template = await ctx.prisma.messageTemplate.findUnique({
                where: { name: "placement test Created" },
            })
            if (!template) throw new TRPCError({ code: "BAD_REQUEST", message: "No message template!" })

            await sendWhatsAppMessage({
                toNumber: `${PlacementTest.student.phone}`,
                prisma: ctx.prisma,
                type: "PlacementTestScheduled",
                variables: {
                    name: PlacementTest.student.name,
                    testTime: format(testTime, "PPPp"),
                    trainerName: tester.user.name,
                    meetingLink,
                }
            })

            return { PlacementTest, oldTest };
        }),
});

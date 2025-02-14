import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createZoomMeeting, deleteZoomMeeting, getAvailableZoomClient, meetingLinkConstructor } from "@/lib/meetingsHelpers";
import { ZoomMeeting } from "@/lib/zoomTypes";
import { env } from "@/env.mjs";
import { format } from "date-fns";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { createMeeting, generateToken, getMeetingDetails, getUserRoom } from "@/lib/onMeetingApi";
import { ZoomClient } from "@prisma/client";

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
                }
            })

            return { placementTest }
        }),
    getCoursePlacementTest: protectedProcedure
        .input(z.object({
            courseId: z.string(),
        }))
        .query(async ({ ctx, input: { courseId } }) => {
            const test = await ctx.prisma.systemForm.findFirst({
                where: {
                    courseId,
                    type: "PlacementTest",
                },
                include: {
                    items: true,
                    submissions: true,
                }
            })

            return { test }
        }),
    getAllPlacementTests: protectedProcedure
        .query(async ({ ctx }) => {
            const courses = await ctx.prisma.course.findMany({
                include: {
                    placementTests: {
                        include: {
                            student: { include: { courseStatus: { include: { level: true } } } },
                            tester: { include: { user: true } },
                            course: { include: { courseStatus: true, levels: true } },
                            writtenTest: { include: { submissions: true } }
                        }
                    }
                }
            })

            const tests = courses
                .flatMap(c => c.placementTests)
                .filter(test => !test.course?.courseStatus.some(s => !!s.courseLevelId && s.courseId === test.course?.id && test.studentUserId === s.userId))

            return { tests }
        }),
    getUserPlacementTest: protectedProcedure
        .input(z.object({
            userId: z.string(),
        }))
        .query(async ({ ctx, input: { userId } }) => {
            const tests = await ctx.prisma.placementTest.findMany({
                where: {
                    studentUserId: userId,
                },
                include: {
                    course: true,
                    student: true,
                    tester: { include: { user: true } },
                    writtenTest: { include: { submissions: true } },
                }
            })

            return { tests }
        }),
    schedulePlacementTest: protectedProcedure
        .input(z.object({
            testTime: z.date(),
            testerId: z.string(),
            leadCode: z.string(),
        }))
        .mutation(async ({ ctx, input: { testTime, leadCode, testerId } }) => {
            const { zoomClient } = await getAvailableZoomClient(testTime, ctx.prisma, 30)
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No available Zoom Accounts at the selected time!" })

            const lead = await ctx.prisma.lead.findUnique({
                where: { code: leadCode },
                include: {
                    orderDetails: { include: { course: true, user: true } }
                }
            })
            if (!lead) throw new TRPCError({ code: "BAD_REQUEST", message: "Lead not found!" })
            if (!lead.orderDetails) throw new TRPCError({ code: "BAD_REQUEST", message: "No order for current lead!" })
            const courseId = lead.orderDetails.courseId
            const userId = lead.orderDetails.userId

            const tester = await ctx.prisma.tester.findUnique({ where: { id: testerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
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
                    const room = await getUserRoom({ token })
                    const { meeting_no } = await createMeeting({
                        token,
                        meetingData: {
                            alert: true,
                            join_before_host: true,
                            recording: true,
                            room_code: room.room_code,
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
                userEmail: lead.orderDetails.user.email,
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
                            sessionLink: meetingLink,
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
                }
            })

            if (oldTest) {
                await deleteZoomMeeting(oldTest.oralTestMeeting.meetingNumber, zoomClient.accessToken)
            }

            const PlacementTest = oldTest
                ? await ctx.prisma.placementTest.update({
                    where: {
                        id: oldTest.id
                    },
                    data: {
                        createdBy: { connect: { id: ctx.session.user.id } },
                        oralTestMeeting: {
                            zoomClientId: zoomClient.id,
                            meetingNumber,
                            meetingPassword,
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
                        oralTestMeeting: {
                            zoomClientId: zoomClient.id,
                            meetingNumber,
                            meetingPassword,
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
                            sessionLink: `${env.NEXTAUTH_URL}${meetingLinkConstructor({ meetingNumber, meetingPassword, sessionTitle: `Placement Test for course ${course.name}` })}`,
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
                }
            })

            if (oldTest) {
                await deleteZoomMeeting(oldTest.oralTestMeeting.meetingNumber, zoomClient.accessToken)
            }

            const PlacementTest = oldTest
                ? await ctx.prisma.placementTest.update({
                    where: {
                        id: oldTest.id
                    },
                    data: {
                        createdBy: { connect: { id: ctx.session.user.id } },
                        oralTestMeeting: {
                            zoomClientId: zoomClient.id,
                            meetingNumber,
                            meetingPassword,
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
                        oralTestMeeting: {
                            zoomClientId: zoomClient.id,
                            meetingNumber,
                            meetingPassword,
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
    deletePlacementTest: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input: { id }, ctx }) => {
            const test = await ctx.prisma.placementTest.findUnique({ where: { id } })
            if (!test) throw new TRPCError({ code: "BAD_REQUEST", message: "No Test Found!" })

            const zoomClient = await ctx.prisma.zoomClient.findUnique({ where: { id: test?.oralTestMeeting.zoomClientId } })
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No available Zoom Accounts at the selected time!" })

            deleteZoomMeeting(test?.oralTestMeeting.meetingNumber, zoomClient.accessToken)

            const deletePlacementTest = await ctx.prisma.placementTest.delete({
                where: {
                    id,
                },
            })

            return { deletePlacementTest };
        }),
});

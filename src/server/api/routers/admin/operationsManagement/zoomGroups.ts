import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validGroupStatuses } from "@/lib/enumsTypes";
import { generateGroupNumnber } from "@/lib/utils";
import { createZoomMeeting, generateGroupMeetingConfig, getAvailableZoomClient, refreshZoomAccountToken } from "@/lib/meetingsHelpers";
import { hasPermission } from "@/server/permissions";
import { createMeeting, generateToken } from "@/lib/onMeetingApi";
import { sendGroupCreatedComms } from "@/server/actions/emails";
import { formatUserForComms } from "@/lib/fcmhelpers"
import { ROOT_EMAIL } from "@/server/constants";

export const zoomGroupsRouter = createTRPCRouter({
    attendSession: protectedProcedure
        .input(z.object({
            sessionId: z.string(),
        }))
        .mutation(async ({ ctx, input: { sessionId } }) => {
            const studentType = ctx.session.user.userRoles
            const studentId = ctx.session.user.id

            if (!studentType.includes("Student")) return { updatedSession: null }

            const session = await ctx.prisma.zoomSession.findUnique({ where: { id: sessionId }, include: { zoomGroup: { select: { studentIds: true } } } })
            if (
                session?.attenders.includes(studentId)
                || !session?.zoomGroup?.studentIds.includes(studentId)
            ) return { updatedSession: null }

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
    getStudentZoomGroups: protectedProcedure
        .input(z.object({
            userId: z.string(),
        }))
        .query(async ({ ctx, input: { userId } }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({
                where: {
                    studentIds: {
                        has: userId
                    },
                },
                orderBy: { createdAt: "desc" },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    teacher: {
                        include: { user: true }
                    },
                    courseLevel: true,
                },
            });

            return { zoomGroups };
        }),
    getZoomGroupByLevel: protectedProcedure
        .input(z.object({
            courseSlug: z.string(),
            levelSlug: z.string(),
        }))
        .query(async ({ ctx, input: { courseSlug, levelSlug } }) => {
            const zoomGroup = await ctx.prisma.zoomGroup.findFirst({
                where: {
                    students: { some: { id: ctx.session.user.id } },
                    groupStatus: { in: ["Active", "Completed"] },
                    course: {
                        slug: courseSlug,
                    },
                    courseLevel: {
                        slug: levelSlug,
                    },
                },
                include: {
                    course: true,
                    zoomSessions: true,
                    teacher: { include: { user: true } },
                    courseLevel: {
                        include: {
                            materialItems: true,
                            certificates: {
                                where: {
                                    userId: ctx.session.user.id,
                                    course: {
                                        slug: courseSlug,
                                    },
                                    courseLevel: {
                                        slug: levelSlug,
                                    }
                                }
                            }
                        }
                    },
                }
            });

            return { zoomGroup };
        }),
    getzoomGroups: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()).optional(),
            courseId: z.string().optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({
                where: {
                    OR: input ? [
                        { id: { in: input.ids } },
                        { courseId: input.courseId },
                    ] : undefined,
                },
                orderBy: { createdAt: "desc" },
                include: {
                    course: true,
                    zoomSessions: true,
                    students: true,
                    teacher: {
                        include: { user: true }
                    },
                    courseLevel: true,
                },
            });

            return { zoomGroups };
        }),
    getGroupSessions: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.zoomSession.findMany({ where: { groupId: input }, include: { assignments: true, quizzes: true, materialItem: true, zoomClient: { select: { isZoom: true } } } })
        }),
    getSessionQuizSubmissions: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return (await ctx.prisma.zoomSession.findUnique({ where: { id: input }, select: { quizzes: { select: { totalScore: true, student: true, systemForm: true } } } }))?.quizzes || []
        }),
    getSessionAssignmentSubmissions: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return (await ctx.prisma.zoomSession.findUnique({ where: { id: input }, select: { assignments: { select: { totalScore: true, student: true, systemForm: true } } } }))?.assignments || []
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
                            assignments: { include: { student: true, systemForm: true } },
                            quizzes: { include: { student: true, systemForm: true } },
                            materialItem: true,
                            zoomClient: { select: { isZoom: true } },
                        },
                        orderBy: {
                            sessionDate: "asc"
                        }
                    },
                    students: { include: { courseStatus: true, orders: true, } },
                    teacher: { include: { user: true } },
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
                    teacher: true,
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
                sessionDates: z.array(z.object({
                    date: z.date(),
                    sessionId: z.string().optional(),
                })),
                studentIds: z.array(z.string()),
                courseId: z.string(),
                teacherId: z.string(),
                courseLevelId: z.string(),
            })
        )
        .mutation(async ({ input: { sessionDates, studentIds, courseId, teacherId, courseLevelId }, ctx }) => {
            if (!hasPermission(ctx.session.user, "zoomGroups", "create"))
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not allowed to take this action, Please contact your Admin!" });

            if (sessionDates.some(d => !d.sessionId))
                throw new TRPCError({ code: "BAD_REQUEST", message: "Some sessions are not found!" });

            const [teacher, course, courseStatuses, studentUsers] = await ctx.prisma.$transaction([
                ctx.prisma.teacher.findUnique({
                    where: { id: teacherId },
                    include: { user: true },
                }),
                ctx.prisma.course.findUnique({
                    where: { id: courseId },
                    include: { levels: { include: { materialItems: true } } },
                }),
                ctx.prisma.courseStatus.findMany({
                    where: { userId: { in: studentIds }, courseId, courseLevelId },
                    orderBy: { updatedAt: "desc" },
                    distinct: "userId",
                }),
                ctx.prisma.user.findMany({
                    where: { id: { in: studentIds } },
                    select: { id: true, name: true, email: true, phone: true, fcmTokens: true },
                }),
            ]);

            if (!teacher) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Teacher doesn't exist!" });
            if (!course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course doesn't exist!" });

            const level = course.levels.find(({ id }) => id === courseLevelId);
            if (!level) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No levels!" });
            if (level.materialItems.length === 0)
                throw new TRPCError({ code: "BAD_REQUEST", message: "No materials in this level!" });

            const startDate = sessionDates[0]?.date;
            if (!startDate)
                throw new TRPCError({ code: "BAD_REQUEST", message: "No dates selected!" });

            const { zoomClient } = await getAvailableZoomClient(startDate, ctx.prisma, 120);
            if (!zoomClient)
                throw new TRPCError({ code: "BAD_REQUEST", message: "No available zoom account at the selected time!" });

            const groupNumber = generateGroupNumnber(startDate, teacher.user.name, course.name);

            const meetingConfig = generateGroupMeetingConfig({
                courseName: course.name,
                groupNumber,
                materialItemsCount: level.materialItems.length,
                levelName: level.name,
                startDate,
                sessionDates,
            });

            let meetingData = { meetingNumber: "", meetingPassword: "" };

            if (!zoomClient.isZoom) {
                if (!zoomClient.roomCode)
                    throw new TRPCError({ code: "BAD_REQUEST", message: "No room in the Account!" });

                const token = await generateToken({
                    api_key: zoomClient.accessToken,
                    api_secret: zoomClient.refreshToken,
                });

                const { meeting_no } = await createMeeting({
                    token,
                    meetingData: {
                        alert: true,
                        join_before_host: true,
                        recording: true,
                        room_code: zoomClient.roomCode,
                        topic: groupNumber,
                    },
                });

                meetingData = { meetingNumber: meeting_no, meetingPassword: "" };
            } else {
                const refreshedClient = await refreshZoomAccountToken(zoomClient, ctx.prisma);
                const { meetingNumber, meetingPassword } = await createZoomMeeting(meetingConfig, refreshedClient.accessToken);
                meetingData = { meetingNumber, meetingPassword };
            }

            const { meetingNumber, meetingPassword } = meetingData;

            if (studentUsers.length !== studentIds.length) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "One or more students do not exist!" });
            }

            const levelExists = await ctx.prisma.courseLevel.findUnique({
                where: { id: courseLevelId },
            });
            if (!levelExists) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Level does not exist!" });
            }

            const materialItemIds = sessionDates.map(s => s.sessionId!) // you've already checked for undefined
            const existingMaterialItems = await ctx.prisma.materialItem.findMany({
                where: { id: { in: materialItemIds } },
                select: { id: true },
            });

            if (existingMaterialItems.length !== materialItemIds.length) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "One or more material items are invalid!" });
            }

            const [zoomGroup] = await ctx.prisma.$transaction([
                ctx.prisma.zoomGroup.create({
                    data: {
                        startDate,
                        meetingNumber,
                        meetingPassword,
                        groupNumber,
                        groupStatus: "Waiting",
                        zoomSessions: {
                            createMany: {
                                data: sessionDates.map(session => ({
                                    attenders: [],
                                    sessionStatus: "Scheduled",
                                    sessionDate: session.date,
                                    meetingNumber,
                                    meetingPassword,
                                    materialItemId: session.sessionId,
                                    zoomClientId: zoomClient.id,
                                })),
                            },
                        },
                        students: { connect: studentIds.map(id => ({ id })) },
                        teacher: { connect: { id: teacherId } },
                        course: { connect: { id: courseId } },
                        courseLevel: { connect: { id: courseLevelId } },
                    },
                    include: {
                        course: true,
                        zoomSessions: { include: { materialItem: true, zoomClient: true } },
                        students: true,
                        teacher: { include: { user: true } },
                    },
                }),
                ctx.prisma.courseStatus.updateMany({
                    where: { id: { in: courseStatuses.map(s => s.id) } },
                    data: { status: "Ongoing" },
                }),
                ...studentIds.map((studentId) =>
                    ctx.prisma.userNote.create({
                        data: {
                            sla: 0,
                            status: "Closed",
                            title: `Zoom Group Created for the Student`,
                            type: "Info",
                            createdForStudent: { connect: { id: studentId } },
                            messages: [{
                                message: `The Student was added to a zoom group ${groupNumber} by ${ctx.session.user.name}`,
                                updatedAt: new Date(),
                                updatedBy: "System"
                            }],
                            createdByUser: { connect: { email: ROOT_EMAIL } },
                        }
                    })
                )
            ]);

            await Promise.all(studentUsers.map(student =>
                sendGroupCreatedComms({
                    trainerName: teacher.user.name,
                    groupStartDate: startDate,
                    courseName: course.name,
                    courseSlug: course.slug,
                    ...formatUserForComms(student),
                })
            ));

            return { zoomGroup };
        }),
    editZoomGroup: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                startDate: z.date().optional(),
                teacherId: z.string().optional(),
                groupStatus: z.enum(validGroupStatuses).optional(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, startDate, teacherId, groupStatus },
            }) => {
                const zoomGroup = await ctx.prisma.zoomGroup.findUnique({
                    where: { id },
                    include: { course: true, students: true, teacher: { include: { user: true } } }
                })

                if (!zoomGroup) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Zoom group doesn't exist!" })

                const teacher = teacherId ? await ctx.prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } }) : null

                const updatedZoomGroup = await ctx.prisma.zoomGroup.update({
                    where: {
                        id,
                    },
                    data: {
                        groupNumber: generateGroupNumnber(startDate || zoomGroup.startDate, teacher?.user.name || zoomGroup.teacher?.user.name!, zoomGroup.course?.name!),
                        startDate: startDate ?? undefined,
                        teacher: teacherId ? { connect: { id: teacherId } } : undefined,
                        groupStatus: groupStatus ?? undefined,
                    },
                    include: {
                        course: true,
                        teacher: { include: { user: true } },
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
                include: { course: true, students: true, teacher: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const courseStatuses = await ctx.prisma.courseStatus.findMany({ where: { userId: { in: studentIds }, courseId: updatedZoomGroup.courseId, courseLevelId: updatedZoomGroup.courseLevelId }, orderBy: { updatedAt: "desc" } })

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { id: { in: courseStatuses.map(s => s.id) } },
                data: {
                    status: "Ongoing"
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
                include: { course: true, students: true, teacher: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const courseStatuses = await ctx.prisma.courseStatus.findMany({ where: { userId: { in: studentIds }, courseId: updatedZoomGroup.courseId, courseLevelId: updatedZoomGroup.courseLevelId }, orderBy: { updatedAt: "desc" } })

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { id: { in: courseStatuses.map(s => s.id) } },
                data: {
                    status: "Waiting"
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
                include: { course: true, students: true, teacher: { include: { user: true } } }
            })

            const updatedNewZoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id: newGroupId },
                data: {
                    students: { connect: studentIdsForPrisma }
                },
                include: { course: true, students: true, teacher: { include: { user: true } } }
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
                include: { course: true, students: true, teacher: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const courseStatuses = await ctx.prisma.courseStatus.findMany({ where: { userId: { in: studentIds }, courseId: updatedZoomGroup.courseId, courseLevelId: updatedZoomGroup.courseLevelId }, orderBy: { updatedAt: "desc" } })

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { id: { in: courseStatuses.map(s => s.id) } },
                data: {
                    status: "Refunded"
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
                include: { course: true, students: true, teacher: { include: { user: true } } }
            })

            if (!updatedZoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't update the zoom group" })

            const courseStatuses = await ctx.prisma.courseStatus.findMany({ where: { userId: { in: studentIds }, courseId: updatedZoomGroup.courseId, courseLevelId: updatedZoomGroup.courseLevelId }, orderBy: { updatedAt: "desc" } })

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { id: { in: courseStatuses.map(s => s.id) } },
                data: {
                    status: "Postponded"
                }
            })

            return { updatedZoomGroup, updatedCourseStatus }
        }),
    resumeStudents: protectedProcedure
        .input(z.object({
            id: z.string(),
            studentIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { id, studentIds } }) => {
            const studentIdsForPrisma = studentIds.map(id => ({ id }))

            const zoomGroup = await ctx.prisma.zoomGroup.update({
                where: { id },
                data: {
                    students: { disconnect: studentIdsForPrisma }
                },
                include: { course: true, students: true, teacher: { include: { user: true } } }
            })
            if (!zoomGroup.courseId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "can't find the zoom group" })

            const courseStatuses = await ctx.prisma.courseStatus.findMany({ where: { userId: { in: studentIds }, courseId: zoomGroup.courseId, courseLevelId: zoomGroup.courseLevelId }, orderBy: { updatedAt: "desc" } })

            const updatedCourseStatus = await ctx.prisma.courseStatus.updateMany({
                where: { id: { in: courseStatuses.map(s => s.id) } },
                data: {
                    status: "Waiting"
                }
            })

            return { updatedCourseStatus }
        }),
    deleteZoomGroup: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "zoomGroups", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not allowed to take this action, Please contact your Admin!" })

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

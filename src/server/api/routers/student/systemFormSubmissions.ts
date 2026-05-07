import { env } from "@/env.mjs";
import { generateCertificateId } from "@/lib/certificatesHelpers";
import { validSystemFormTypes } from "@/lib/enumsTypes";
import { getSubmissionScore } from "@/lib/utils";
import { formatUserForComms } from "@/lib/fcmhelpers"
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { hasPermission } from "@/server/permissions";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendCertificateComms } from "@/server/actions/emails";

export const systemFormSubmissionsRouter = createTRPCRouter({
    getByRelationId: protectedProcedure
        .input(z.object({
            id: z.string(),
            type: z.enum(validSystemFormTypes),
        }))
        .query(async ({ ctx, input: { id, type } }) => {
            return ctx.prisma.systemFormSubmission.findFirst({
                where: {
                    studentId: ctx.session.user.id,
                    OR: [
                        { assignmentZoomSessionId: id },
                        { quizZoomSessionId: id },
                        { systemFormId: id }
                    ],
                    systemForm: { type }
                }
            })
        }),
    getSystemFormSubmissions: protectedProcedure
        .query(async ({ ctx }) => {
            const submissions = await ctx.prisma.systemFormSubmission.findMany()

            return { submissions }
        }),
    getUserSubmissionDetails: protectedProcedure
        .input(z.object({
            courseSlug: z.string(),
            levelSlug: z.string().optional(),
            sessionId: z.string().optional(),
            formType: z.enum(validSystemFormTypes),
        }))
        .query(async ({ ctx, input: { courseSlug, levelSlug, sessionId, formType } }) => {
            const userId = ctx.session.user.id

            console.log(formType, levelSlug, sessionId)

            if (!levelSlug && !sessionId) {
                const systemForm = await ctx.prisma.systemForm.findFirst({
                    where: {
                        course: { slug: courseSlug },
                        type: "PlacementTest"
                    },
                    include: { submissions: { where: { studentId: userId }, include: { student: true } }, items: { include: { questions: { include: { options: true } } } } },
                })
                if (!systemForm) return { error: "No placement test found!" }

                const submission = systemForm.submissions[0]

                return { isSubmitted: !!submission, submission, systemForm }
            } else if (!sessionId) {
                const systemForm = await ctx.prisma.systemForm.findFirst({
                    where: { courseLevel: { slug: levelSlug }, type: "FinalTest" },
                    include: { submissions: { where: { studentId: userId }, include: { student: true } }, items: { include: { questions: { include: { options: true } } } } },
                })
                if (!systemForm) return { error: "No final test found!" }

                const submission = systemForm.submissions[0]

                return { isSubmitted: !!submission, submission, systemForm }
            } else {
                const systemForm = await ctx.prisma.systemForm.findFirst({
                    where: { materialItem: { zoomSessions: { some: { id: sessionId } } }, type: formType },
                    include: { submissions: { where: { studentId: userId, systemForm: { type: formType } }, include: { student: true } }, items: { include: { questions: { include: { options: true } } } } },
                })
                if (!systemForm) return { error: `No ${formType} form found!` }

                const submission = systemForm.submissions.find(sub => sub.studentId === userId)

                return { isSubmitted: !!submission, submission, systemForm }
            }
        }),
    getSubmissionDetails: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ ctx, input: { id } }) => {
            const submission = await ctx.prisma.systemFormSubmission.findUnique({ where: { id }, include: { student: true, systemForm: { include: { items: { include: { questions: { include: { options: true } } } } } } } })
            if (!submission) throw new TRPCError({ code: "BAD_REQUEST", message: "No Submission Found!" })

            return { submission }
        }),
    createSystemFormSubmission: protectedProcedure
        .input(z.object({
            formId: z.string(),
            courseSlug: z.string().optional(),
            levelId: z.string().optional(),
            sessionId: z.string().optional(),
            answers: z.array(z.object({
                questionId: z.string(),
                selectedAnswers: z.array(z.string()),
                textAnswer: z.string().optional(),
            })),
            type: z.enum(validSystemFormTypes),
        }))
        .mutation(async ({ ctx, input: { answers, formId, type, courseSlug, levelId, sessionId } }) => {
            const systemForm = await ctx.prisma.systemForm.findUnique({
                where: { id: formId },
                include: {
                    items: { include: { questions: { include: { options: true } } } }
                }
            })
            if (!systemForm) throw new TRPCError({ code: "NOT_FOUND", message: "Couldn't get this form!" })

            const userId = ctx.session.user.id

            const user = await ctx.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    zoomGroups: {
                        where: {
                            course: { slug: courseSlug },
                            courseLevel: levelId ? { id: levelId } : undefined,
                        },
                        include: {
                            zoomSessions: {
                                include: {
                                    assignments: true,
                                    quizzes: true,
                                    materialItem: true,
                                }
                            },
                            course: true,
                        }
                    },
                }
            })

            const correctedAnswers = answers.map(ans => ({
                ...ans,
                textAnswer: ans.textAnswer || null,
                isCorrect: ans.selectedAnswers.every(answer => systemForm.items.flatMap(item => item.questions).find(q => q.id === ans.questionId)?.options.some(o => o.value === answer && o.isCorrect))
            }))

            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "no user found!" })

            // Find the correct group
            const zoomGroup = user.zoomGroups[0];
            const zoomGroupId = zoomGroup?.id;

            const submission = await ctx.prisma.systemFormSubmission.create({
                data: {
                    answers: correctedAnswers,
                    totalScore: getSubmissionScore(systemForm?.items.flatMap(item => item.questions), correctedAnswers),
                    student: { connect: { id: ctx.session.user.id } },
                    systemForm: { connect: { id: systemForm.id } },
                    zoomGroup: (type === "PlacementTest" || type === "FinalTest") && zoomGroupId
                        ? { connect: { id: zoomGroupId } }
                        : undefined,
                    assignmentZoomSession: type === "Assignment" && sessionId
                        ? { connect: { id: sessionId } }
                        : undefined,
                    quizZoomSession: type === "Quiz" && sessionId
                        ? { connect: { id: sessionId } }
                        : undefined,
                },
                include: { systemForm: true }
            })

            if (type === "FinalTest" && user.userRoles.includes("Student")) {
                await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Student final test submitted with score ${submission.totalScore}`,
                        type: "Info",
                        messages: [{
                            message: `Final test submitted and waiting for teacher/admin progression approval.`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                        createdForStudent: { connect: { id: user.id } }
                    }
                })
            }

            return {
                submission,
            };
        }),
    deleteSystemFormSubmission: protectedProcedure
        .input(z.object({
            ids: z.array(z.string())
        }))
        .mutation(async ({ ctx, input: { ids } }) => {
            if (!hasPermission(ctx.session.user, "systemFormsSubmissions", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You're not authorized to take this action, please contact your Admin!" })

            const deletedSubmissions = await ctx.prisma.systemFormSubmission.deleteMany({
                where: { id: { in: ids } }
            })

            return { deletedSubmissions }
        }),
    submitOralTest: protectedProcedure
        .input(z.object({
            id: z.string(),
            oralFeedback: z.string(),
        }))
        .mutation(async ({ ctx, input: { id, oralFeedback } }) => {
            if (!hasPermission(ctx.session.user, "systemFormsSubmissions", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You're not authorized to take this action, please contact your Admin!" })

            const updatedSubmission = await ctx.prisma.systemFormSubmission.update({
                where: { id },
                data: { oralFeedback }
            })

            return { updatedSubmission }
        }),
    approveFinalTestOutcome: protectedProcedure
        .input(z.object({
            submissionId: z.string(),
            outcome: z.enum(["MoveNextLevel", "RepeatLevel", "CompleteCourse"]),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input: { submissionId, outcome, notes } }) => {
            if (!hasPermission(ctx.session.user, "systemFormsSubmissions", "update")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You're not authorized to take this action, please contact your Admin!" })
            }

            const submission = await ctx.prisma.systemFormSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    student: true,
                    systemForm: {
                        include: {
                            course: {
                                include: {
                                    levels: {
                                        orderBy: [{ levelOrder: "asc" }, { createdAt: "asc" }],
                                    },
                                },
                            },
                            courseLevel: true,
                        },
                    },
                },
            })

            if (!submission) throw new TRPCError({ code: "BAD_REQUEST", message: "Submission not found!" })
            if (submission.systemForm.type !== "FinalTest") {
                throw new TRPCError({ code: "BAD_REQUEST", message: "This action is available for final test submissions only." })
            }

            const currentLevel = submission.systemForm.courseLevel
            if (!currentLevel || currentLevel.levelOrder === null) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Current level is not configured correctly." })
            }

            const resolvedCourseId = submission.systemForm.courseId || submission.systemForm.courseLevel?.courseId
            if (!resolvedCourseId) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Course relation is missing on this submission." })
            }

            const course = submission.systemForm.course || await ctx.prisma.course.findUnique({
                where: { id: resolvedCourseId },
                include: {
                    levels: {
                        orderBy: [{ levelOrder: "asc" }, { createdAt: "asc" }],
                    },
                },
            })

            if (!course) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Course relation is missing on this submission." })
            }

            const sourceStatus = await ctx.prisma.courseStatus.findFirst({
                where: {
                    userId: submission.studentId,
                    courseId: resolvedCourseId,
                    courseLevelId: currentLevel.id,
                },
                orderBy: { updatedAt: "desc" },
            })
            if (!sourceStatus) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "No course status found for the submitted level." })
            }

            let targetLevel = currentLevel
            if (outcome === "MoveNextLevel") {
                const orderedLevels = [...course.levels].sort((a, b) => {
                    const aOrder = a.levelOrder ?? Number.MAX_SAFE_INTEGER
                    const bOrder = b.levelOrder ?? Number.MAX_SAFE_INTEGER
                    if (aOrder !== bOrder) return aOrder - bOrder
                    return a.createdAt.getTime() - b.createdAt.getTime()
                })

                const currentLevelIndex = orderedLevels.findIndex(level => level.id === currentLevel.id)
                if (currentLevelIndex === -1) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Current level is not linked to course levels correctly." })
                }

                const nextLevel = orderedLevels[currentLevelIndex + 1]

                if (!nextLevel) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "No next level available for this course." })
                }

                targetLevel = nextLevel
            }

            if (outcome !== "CompleteCourse") {
                const existingTargetStatus = await ctx.prisma.courseStatus.findFirst({
                    where: {
                        userId: submission.studentId,
                        courseId: resolvedCourseId,
                        orderId: sourceStatus.orderId,
                        courseLevelId: targetLevel.id,
                        status: { in: ["Waiting", "PlacementTest", "OrderPaid"] },
                    },
                    orderBy: { updatedAt: "desc" },
                })

                if (existingTargetStatus) {
                    await ctx.prisma.courseStatus.update({
                        where: { id: existingTargetStatus.id },
                        data: { status: "Waiting" },
                    })
                } else {
                    await ctx.prisma.courseStatus.create({
                        data: {
                            status: "Waiting",
                            isPrivate: sourceStatus.isPrivate,
                            course: { connect: { id: resolvedCourseId } },
                            user: { connect: { id: submission.studentId } },
                            order: { connect: { id: sourceStatus.orderId } },
                            level: { connect: { id: targetLevel.id } },
                        },
                    })
                }
            }

            const outcomeText = outcome === "MoveNextLevel"
                ? `Approved to move to next level (${targetLevel.name}).`
                : outcome === "RepeatLevel"
                    ? `Marked to repeat current level (${targetLevel.name}).`
                    : `Approved course completion at final level (${currentLevel.name}).`

            const decisionNote = notes?.trim() ? `${outcomeText}\n${notes.trim()}` : outcomeText

            if (outcome === "MoveNextLevel" || outcome === "CompleteCourse") {
                const existingCertificate = await ctx.prisma.certificate.findFirst({
                    where: {
                        userId: submission.studentId,
                        courseId: resolvedCourseId,
                        courseLevelId: currentLevel.id,
                    },
                })

                const certificate = existingCertificate || await ctx.prisma.certificate.create({
                    data: {
                        certificateId: generateCertificateId(),
                        completionDate: new Date(),
                        user: { connect: { id: submission.studentId } },
                        course: { connect: { id: resolvedCourseId } },
                        courseLevel: { connect: { id: currentLevel.id } },
                    },
                })

                await sendCertificateComms({
                    certificateLink: `${env.NEXTAUTH_URL}student/my_courses/${course.slug}/${currentLevel.slug}/certificate`,
                    courseName: course.name,
                    ...formatUserForComms(submission.student),
                })

                await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: "Certificate issued after progression approval",
                        type: "Info",
                        messages: [{
                            message: `Certificate ${certificate.certificateId} issued after final test ${outcome === "CompleteCourse" ? "course completion" : "progression"} approval for ${currentLevel.name}.`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                        createdForStudent: { connect: { id: submission.studentId } }
                    }
                })
            }

            const updatedSubmission = await ctx.prisma.systemFormSubmission.update({
                where: { id: submission.id },
                data: {
                    oralFeedback: submission.oralFeedback
                        ? `${submission.oralFeedback}\n\n[Progress Decision]\n${decisionNote}`
                        : `[Progress Decision]\n${decisionNote}`,
                },
            })

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: "Final test progression decision",
                    type: "Info",
                    messages: [{
                        message: `Final test reviewed by ${ctx.session.user.name}. ${decisionNote}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: ctx.session.user.id } },
                    createdForStudent: { connect: { id: submission.studentId } }
                }
            })

            return {
                updatedSubmission,
                student: submission.student,
                targetLevelName: targetLevel.name,
                outcome,
            }
        })
});

import { env } from "@/env.mjs";
import { generateCertificateId } from "@/lib/certificatesHelpers";
import { validSystemFormTypes } from "@/lib/enumsTypes";
import { getSubmissionScore } from "@/lib/utils";
import { sendCertificateComms } from "@/server/actions/emails";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { hasPermission } from "@/server/permissions";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const systemFormSubmissionsRouter = createTRPCRouter({
    getSystemFormSubmissions: protectedProcedure
        .query(async ({ ctx }) => {
            const submissions = await ctx.prisma.systemFormSubmission.findMany()

            return { submissions }
        }),
    getUserSubmissionDetails: protectedProcedure
        .input(z.object({
            courseSlug: z.string(),
            levelSlug: z.string().optional(),
            materialItemSlug: z.string().optional(),
            formType: z.enum(validSystemFormTypes),
        }))
        .query(async ({ ctx, input: { courseSlug, levelSlug, materialItemSlug, formType } }) => {
            const userId = ctx.session.user.id

            if (!levelSlug && !materialItemSlug) {
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
            } else if (!materialItemSlug) {
                const systemForm = await ctx.prisma.systemForm.findFirst({
                    where: { courseLevel: { slug: levelSlug }, type: "FinalTest" },
                    include: { submissions: { where: { studentId: userId }, include: { student: true } }, items: { include: { questions: { include: { options: true } } } } },
                })
                if (!systemForm) return { error: "No final test found!" }

                const submission = systemForm.submissions[0]

                return { isSubmitted: !!submission, submission, systemForm }
            } else {
                const systemForm = await ctx.prisma.systemForm.findFirst({
                    where: { materialItem: { slug: materialItemSlug }, type: formType },
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
            answers: z.array(z.object({
                questionId: z.string(),
                selectedAnswers: z.array(z.string()),
                textAnswer: z.string().optional(),
            })),
            type: z.enum(validSystemFormTypes),
        }))
        .mutation(async ({ ctx, input: { answers, formId, type, courseSlug, levelId } }) => {
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

            const zoomGroupId = user.zoomGroups.find(group => group.course?.slug === courseSlug)?.id
            const zoomSessionId = user.zoomGroups.find(group => group.course?.slug === courseSlug)?.zoomSessions.find(session => session.materialItemId === systemForm.materialItemId)?.id

            const submission = await ctx.prisma.systemFormSubmission.create({
                data: {
                    answers: correctedAnswers,
                    totalScore: getSubmissionScore(systemForm?.items.flatMap(item => item.questions), correctedAnswers),
                    student: { connect: { id: ctx.session.user.id } },
                    systemForm: { connect: { id: systemForm.id } },
                    zoomGroup: (type === "PlacementTest" || type === "FinalTest") && zoomGroupId
                        ? { connect: { id: zoomGroupId } }
                        : undefined,
                    assignmentZoomSession: type === "Assignment" && zoomSessionId
                        ? { connect: { id: zoomSessionId } }
                        : undefined,
                    quizZoomSession: type === "Quiz" && zoomSessionId
                        ? { connect: { id: zoomSessionId } }
                        : undefined,
                },
                include: { systemForm: true }
            })

            if (type === "FinalTest" && user.userRoles.includes("Student")) {
                const certificate = await ctx.prisma.certificate.create({
                    data: {
                        certificateId: generateCertificateId(),
                        completionDate: new Date(),
                        user: { connect: { id: userId } },
                        course: { connect: { slug: courseSlug } },
                        courseLevel: { connect: { id: levelId } },
                    },
                    include: { courseLevel: { select: { slug: true } }, course: { select: { name: true } } }
                })

                await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Student final test submitted with score ${submission.totalScore}`,
                        type: "Info",
                        messages: [{
                            message: `Final test submitted and user certificate was Created ${certificate.certificateId}\nCertificate URL: ${env.NEXTAUTH_URL}student/certificates/${certificate.certificateId}`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                        createdForStudent: { connect: { id: user.id } }
                    }
                })

                await sendCertificateComms({
                    certificateLink: `${env.NEXTAUTH_URL}student/my_courses/${courseSlug}/${certificate.courseLevel?.slug}/certificate`,
                    courseName: certificate.course.name,
                    studentEmail: user.email,
                    studentName: user.name,
                    studentPhone: user.phone,
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
        })
});

import { env } from "@/env.mjs";
import { validEvalFormTypes } from "@/lib/enumsTypes";
import { generateCertificateId, getRating } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, EvaluationFormTypes, GoogleForm, MaterialItem, SubmissionAnswer } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export type UserSubmissionReturnType = ReturnType<typeof userSubmissionDetails>

const userSubmissionDetails = (systemForm: EvaluationForm & {
  googleForm: GoogleForm | null;
  materialItem: MaterialItem | null;
  submissions: EvaluationFormSubmission[];
  questions: EvaluationFormQuestion[];
}, userId: string, userEmail: string) => {
  const googleForm = systemForm.googleForm

  if (!googleForm) {
    const systemFormSubmission = systemForm.submissions.find(sub => sub.userId === userId)
    if (!systemFormSubmission) return { isSubmitted: false, original: { formFullScore: systemForm.totalPoints, systemForm } }
    return { isSubmitted: true, systemFormSubmission, original: { formFullScore: systemForm.totalPoints, systemForm } }
  } else {
    const googleFormSubmission = googleForm.responses.find(res => res.userEmail === userEmail)
    if (!googleFormSubmission) return { isSubmitted: false, original: { formFullScore: systemForm.totalPoints, googleForm } }
    return { isSubmitted: true, googleFormSubmission, original: { formFullScore: systemForm.totalPoints, googleForm } }
  }
}

export const evaluationFormSubmissionsRouter = createTRPCRouter({
  getEvalFormSubmission: protectedProcedure
    .query(async ({ ctx }) => {
      const submissions = await ctx.prisma.evaluationFormSubmission.findMany()

      return { submissions }
    }),
  getUserSubmissionDetails: protectedProcedure
    .input(z.object({
      courseSlug: z.string(),
      levelSlug: z.string().optional(),
      materialItemSlug: z.string().optional(),
      isAssignment: z.boolean().optional(),
    }))
    .query(async ({ ctx, input: { courseSlug, levelSlug, materialItemSlug, isAssignment } }) => {
      const userId = ctx.session.user.id
      const userEmail = ctx.session.user.email
      const formType: EvaluationFormTypes = isAssignment ? "assignment" : "quiz"
      const course = await ctx.prisma.course.findUnique({
        where: { slug: courseSlug },
        include: { evaluationForms: { include: { googleForm: true, submissions: true, materialItem: true, questions: true } } },
      })
      if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course was not found!" })

      if (!levelSlug && !materialItemSlug) {
        const systemForm = course.evaluationForms.find(form => form.type === "placementTest")
        if (!systemForm) throw new TRPCError({ code: "BAD_REQUEST", message: "No Placement Test Found!" })

        return userSubmissionDetails(systemForm, userId, userEmail as string)
      } else if (!materialItemSlug) {
        const systemForm = course.evaluationForms.find(form => form.type === "finalTest")
        if (!systemForm) throw new TRPCError({ code: "BAD_REQUEST", message: "No Final Test Found!" })

        return userSubmissionDetails(systemForm, userId, userEmail as string)
      } else {
        const systemForm = course.evaluationForms.find(form => form.materialItem?.slug === materialItemSlug && form.type === formType)
        if (!systemForm) throw new TRPCError({ code: "BAD_REQUEST", message: `No ${formType} found` })

        return userSubmissionDetails(systemForm, userId, userEmail as string)
      }
    }),
  getUserEvalFormSubmission: protectedProcedure
    .query(async ({ ctx }) => {
      const submissions = await ctx.prisma.evaluationFormSubmission.findMany({
        where: { userId: ctx.session.user.id }
      })

      return { submissions }
    }),
  getFinalTestSubmissions: protectedProcedure
    .input(z.object({
      slug: z.string().optional(),
    }))
    .query(async ({ ctx, input: { slug } }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { slug },
        include: {
          evaluationForms: {
            include: {
              submissions: {
                include: {
                  student: {
                    include: {
                      certificates: { where: { course: { slug } }, take: 1 }
                    }
                  }
                }
              }
            }
          }
        }
      })
      if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

      return { submissions: course.evaluationForms.find(form => form.type === "finalTest")?.submissions, course }
    }),
  createEvalFormSubmission: protectedProcedure
    .input(z.object({
      evaluationFormId: z.string(),
      courseId: z.string().optional(),
      levelId: z.string().optional(),
      answers: z.array(z.object({
        text: z.string().nullable(),
        isTrue: z.boolean().nullable(),
        questionId: z.string(),
      })),
      type: z.enum(validEvalFormTypes),
    }))
    .mutation(async ({ ctx, input: { answers, evaluationFormId, type, courseId, levelId } }) => {
      const evaluationForm = await ctx.prisma.evaluationForm.findUnique({
        where: { id: evaluationFormId },
        include: { questions: true }
      })
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
              }
            }
          },
        }
      })

      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "no user found!" })
      if (evaluationForm?.questions.length !== answers.length) throw new TRPCError({ code: "BAD_REQUEST", message: "missing some answers!" })

      if (type === "finalTest") {
        const certificate = await ctx.prisma.certificate.create({
          data: {
            certificateId: generateCertificateId(),
            completionDate: new Date(),
            user: { connect: { id: userId } },
            course: { connect: { id: courseId } },
            courseLevel: { connect: { id: levelId } },
          }
        })

        await ctx.prisma.userNote.create({
          data: {
            sla: 0,
            status: "Closed",
            title: `Student final test submitted with score ${getRating(evaluationForm.questions, answers)}`,
            type: "Info",
            messages: [{
              message: `Final test submitted and user certificate was created ${certificate.certificateId}\nCertificate URL: ${env.NEXTAUTH_URL}certificates/${certificate.certificateId}`,
              updatedAt: new Date(),
              updatedBy: "System"
            }],
            createdByUser: { connect: { id: ctx.session.user.id } },
            createdForStudent: { connect: { id: user.id } }
          }
        })
      }

      const zoomGroupId = user.zoomGroups.find(group => group.courseId === courseId)?.id
      const zoomSessionId = user.zoomGroups.find(group => group.courseId === courseId)?.zoomSessions.find(session => session.materialItemId === evaluationForm.materialItemId)?.id

      const evaluationFormSubmission = await ctx.prisma.evaluationFormSubmission.create({
        data: {
          answers: answers,
          rating: getRating(evaluationForm.questions, answers),
          student: {
            connect: { id: userId },
          },
          evaluationForm: { connect: { id: evaluationFormId } },
          zoomGroup: (type === "placementTest" || type === "finalTest") && zoomGroupId
            ? { connect: { id: zoomGroupId } }
            : undefined,
          zoomSessionAsAssignment: type === "assignment" && zoomSessionId
            ? { connect: { id: zoomSessionId } }
            : undefined,
          zoomSessionAsQuiz: type === "quiz" && zoomSessionId
            ? { connect: { id: zoomSessionId } }
            : undefined,
        },
      })

      return {
        evaluationFormSubmission,
      };
    }),
});

import { validEvalFormTypes } from "@/lib/enumsTypes";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { EvaluationFormQuestion, SubmissionAnswer } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const evaluationFormSubmissionsRouter = createTRPCRouter({
  getEvalFormSubmission: protectedProcedure
    .query(async ({ ctx }) => {
      const submissions = await ctx.prisma.evaluationFormSubmission.findMany()

      return { submissions }
    }),
  createEvalFormSubmission: protectedProcedure
    .input(z.object({
      evaluationFormlId: z.string(),
      courseId: z.string().optional(),
      answers: z.array(z.object({
        text: z.string().nullable(),
        isTrue: z.boolean().nullable(),
        questionId: z.string(),
      })),
      type: z.enum(validEvalFormTypes),
    }))
    .mutation(async ({ ctx, input: { answers, evaluationFormlId, type, courseId } }) => {
      const evaluationForm = await ctx.prisma.evaluationForm.findUnique({
        where: { id: evaluationFormlId },
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

      const getRating = (questions: EvaluationFormQuestion[], answers: SubmissionAnswer[]): number => {
        let points = 0

        for (let i = 0; i < answers.length; i++) {
          const answer = answers[i];
          const question = questions.find(question => question.id === answer?.questionId)

          if (question) {
            const correctOption = question.options.find(option => option.isCorrect)
            if (question.type === "multipleChoice" && correctOption?.text === answer?.text) points += question.points
            if (question.type === "trueFalse" && correctOption?.isTrue === answer?.isTrue) points += question.points
          }
        }
        return points
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
          evaluationForm: { connect: { id: evaluationFormlId } },
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

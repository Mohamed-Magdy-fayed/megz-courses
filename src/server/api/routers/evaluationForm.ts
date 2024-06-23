import { validEvalFormTypes } from "@/lib/enumsTypes";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const evaluationFormRouter = createTRPCRouter({
  getEvalFormById: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input: { id } }) => {
      const evaluationForm = await ctx.prisma.evaluationForm.findUnique({
        where: { id },
        include: { materialItem: { include: { zoomSessions: true } }, questions: true, submissions: true }
      })

      return { evaluationForm }
    }),
  getEvalFormsAssginments: protectedProcedure
    .input(z.object({
      courseId: z.string(),
    }))
    .query(async ({ ctx, input: { courseId } }) => {
      const assignments = await ctx.prisma.evaluationForm.findMany({
        where: { type: "assignment", materialItem: { courseId } },
        orderBy: { createdAt: "asc" },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return { assignments }
    }),
  getEvalFormsQuizzes: protectedProcedure
    .input(z.object({
      courseId: z.string(),
    }))
    .query(async ({ ctx, input: { courseId } }) => {
      const quizzes = await ctx.prisma.evaluationForm.findMany({
        where: { type: "quiz", materialItem: { courseId } },
        orderBy: { createdAt: "asc" },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return { quizzes }
    }),
  getSessionQuiz: protectedProcedure
    .input(z.object({
      materialItemId: z.string(),
    }))
    .query(async ({ ctx, input: { materialItemId } }) => {
      const quiz = await ctx.prisma.evaluationForm.findFirst({
        where: { type: "quiz", materialItemId },
        orderBy: { createdAt: "asc" },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return { quiz }
    }),
  getSessionAssignment: protectedProcedure
    .input(z.object({
      materialItemId: z.string(),
    }))
    .query(async ({ ctx, input: { materialItemId } }) => {
      const quiz = await ctx.prisma.evaluationForm.findFirst({
        where: { type: "assignment", materialItemId },
        orderBy: { createdAt: "asc" },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return { quiz }
    }),
  createEvalForm: protectedProcedure
    .input(z.object({
      materialId: z.string(),
      type: z.enum(validEvalFormTypes),
      fields: z.array(z.object({
        question: z.string(),
        points: z.number().min(1).max(5),
        type: z.enum(["multipleChoice", "trueFalse"]),
        image: z.string().optional().nullable(),
        options: z.array(z.object({
          isTrue: z.boolean().nullable(),
          text: z.string().nullable(),
          isCorrect: z.boolean()
        })).max(6).optional(),
        correctAnswer: z.boolean().optional(),
      }))
    }))
    .mutation(async ({ ctx, input: { materialId, fields, type } }) => {
      if (!ctx.session.user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" })

      const evaluationForm = await ctx.prisma.evaluationForm.create({
        data: {
          totalPoints: fields.map(field => field.points).reduce((a, b) => a + b, 0),
          type,
          materialItem: { connect: { id: materialId } },
          questions: {
            createMany: {
              data: fields.map(field => ({
                points: field.points,
                questionText: field.question,
                type: field.type,
                image: field.image,
                options: field.options,
              }))
            }
          },
          createdBy: ctx.session.user.email,
        },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return {
        evaluationForm,
      };
    }),
  editEvalForm: protectedProcedure
    .input(z.object({
      id: z.string(),
      fields: z.array(z.object({
        question: z.string(),
        points: z.number().min(1).max(5),
        type: z.enum(["multipleChoice", "trueFalse"]),
        image: z.string().optional().nullable(),
        options: z.array(z.object({
          text: z.string(),
          isCorrect: z.boolean()
        })).max(6).optional(),
      }))
    }))
    .mutation(async ({ ctx, input: { fields, id } }) => {
      const evaluationForm = await ctx.prisma.evaluationForm.update({
        where: { id },
        data: {
          totalPoints: fields.map(field => field.points).reduce((a, b) => a + b, 0),
          questions: {
            createMany: {
              data: fields.map(field => ({
                points: field.points,
                questionText: field.question,
                type: field.type,
                image: field.image,
                options: field.options,
              }))
            }
          },
        },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return {
        evaluationForm,
      };
    }),
  deleteEvalForm: protectedProcedure
    .input(z.object({
      ids: z.array(z.string())
    }))
    .mutation(async ({ ctx, input: { ids } }) => {
      const deletedEvalForms = await ctx.prisma.evaluationForm.deleteMany({
        where: { id: { in: ids } },
      })

      return { deletedEvalForms }
    }),
});

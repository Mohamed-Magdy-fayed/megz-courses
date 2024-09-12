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
  getEvalFormByMaterialItemSlug: protectedProcedure
    .input(z.object({
      slug: z.string(),
      type: z.enum(validEvalFormTypes).optional(),
    }))
    .query(async ({ ctx, input: { slug, type } }) => {
      if (!type) throw new TRPCError({ code: "BAD_REQUEST", message: "no type specified" })

      const evaluationForm = await ctx.prisma.evaluationForm.findFirst({
        where: { materialItem: { slug }, type },
        include: { materialItem: { include: { zoomSessions: true } }, questions: true, submissions: true }
      })

      return { evaluationForm }
    }),
  getEvalFormsAssginments: protectedProcedure
    .input(z.object({
      levelId: z.string(),
    }))
    .query(async ({ ctx, input: { levelId } }) => {
      const assignments = await ctx.prisma.evaluationForm.findMany({
        where: { type: "assignment", materialItem: { courseLevelId: levelId } },
        orderBy: { createdAt: "asc" },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return { assignments }
    }),
  getEvalFormsQuizzes: protectedProcedure
    .input(z.object({
      levelId: z.string(),
    }))
    .query(async ({ ctx, input: { levelId } }) => {
      const quizzes = await ctx.prisma.evaluationForm.findMany({
        where: { type: "quiz", materialItem: { courseLevelId: levelId } },
        orderBy: { createdAt: "asc" },
        include: { materialItem: true, questions: true, submissions: { include: { student: true } }, course: true }
      })

      return { quizzes }
    }),
  getPlacementTest: protectedProcedure
    .input(z.object({
      courseId: z.string(),
    }))
    .query(async ({ ctx, input: { courseId } }) => {
      const placementTest = await ctx.prisma.evaluationForm.findFirst({
        where: { type: "placementTest", courseId },
        include: { materialItem: true, questions: true, submissions: { include: { student: true } }, course: true }
      })

      return { placementTest }
    }),
  getTrainerPlacementTest: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const placementTests = await ctx.prisma.placementTest.findMany({
        where: { trainer: { userId } },
        include: {
          course: { include: { levels: true } },
          student: { include: { courseStatus: { include: { course: true, level: true } } } },
          trainer: { include: { user: true } },
          writtenTest: { include: { submissions: true, questions: true } },
          createdBy: true,
        },
        orderBy: { createdAt: "desc" }
      })

      return { placementTests }
    }),
  getFinalTest: protectedProcedure
    .input(z.object({
      courseSlug: z.string(),
    }))
    .query(async ({ ctx, input: { courseSlug } }) => {
      const finalTest = await ctx.prisma.evaluationForm.findFirst({
        where: { type: "finalTest", course: { slug: courseSlug } },
        include: {
          materialItem: {
            include: { zoomSessions: true }
          }, questions: true, submissions: true
        }
      })

      return { finalTest }
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
  createGoogleEvalForm: protectedProcedure
    .input(z.object({
      url: z.string(),
      materialId: z.string(),
      type: z.enum(validEvalFormTypes),
    }))
    .mutation(async ({ ctx, input: { url, materialId, type } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })

      if (!ctx.session.user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" })
      if (await ctx.prisma.evaluationForm.findFirst({
        where: {
          AND: {
            materialItemId: materialId,
            type,
          }
        }
      })) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to create multible forms on the same type!" })

      const evaluationForm = await ctx.prisma.evaluationForm.create({
        data: {
          totalPoints: 0,
          type,
          externalLink: url,
          materialItem: { connect: { id: materialId } },
          createdBy: ctx.session.user.email,
        },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return {
        evaluationForm,
      };
    }),
  editGoogleEvalForm: protectedProcedure
    .input(z.object({
      id: z.string(),
      url: z.string(),
    }))
    .mutation(async ({ ctx, input: { url, id } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      if (!ctx.session.user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" })

      const evaluationForm = await ctx.prisma.evaluationForm.update({
        where: {
          id
        },
        data: {
          totalPoints: 0,
          externalLink: url,
          createdBy: ctx.session.user.email,
        },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return {
        evaluationForm,
      };
    }),
  createEvalForm: protectedProcedure
    .input(z.object({
      materialId: z.string(),
      type: z.enum(validEvalFormTypes),
      fields: z.array(z.object({
        questionText: z.string(),
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
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      if (!ctx.session.user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" })
      if (await ctx.prisma.evaluationForm.findFirst({
        where: {
          AND: {
            materialItemId: materialId,
            type,
          }
        }
      })) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to create multible forms on the same type!" })

      const evaluationForm = await ctx.prisma.evaluationForm.create({
        data: {
          totalPoints: fields.map(field => field.points).reduce((a, b) => a + b, 0),
          type,
          materialItem: { connect: { id: materialId } },
          questions: {
            createMany: {
              data: fields.map(field => ({
                points: field.points,
                questionText: field.questionText,
                type: field.type,
                image: field.image,
                options: field.options,
              }))
            },
          },
          createdBy: ctx.session.user.email,
        },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return {
        evaluationForm,
      };
    }),
  createTestEvalForm: protectedProcedure
    .input(z.object({
      slug: z.string(),
      courseLevel: z.string().optional(),
      type: z.enum(validEvalFormTypes),
      fields: z.array(z.object({
        questionText: z.string(),
        points: z.number().min(1).max(5),
        type: z.enum(["multipleChoice", "trueFalse"]),
        image: z.string().optional().nullable(),
        options: z.array(z.object({
          isTrue: z.boolean().nullable(),
          text: z.string().nullable(),
          isCorrect: z.boolean()
        })).max(6).optional(),
        correctAnswer: z.boolean().optional().optional(),
      }))
    }))
    .mutation(async ({ ctx, input: { slug, fields, type, courseLevel } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      if (!ctx.session.user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" })
      if (await ctx.prisma.evaluationForm.findFirst({
        where: {
          AND: {
            course: {
              slug,
            },
            type,
            courseLevelId: courseLevel,
          }
        }
      })) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to create multible forms on the same type!" })

      const evaluationForm = await ctx.prisma.evaluationForm.create({
        data: {
          totalPoints: fields.map(field => field.points).reduce((a, b) => a + b, 0),
          type,
          course: { connect: { slug } },
          questions: {
            createMany: {
              data: fields,
            }
          },
          createdBy: ctx.session.user.email,
          courseLevel: courseLevel && type === "finalTest" ? {
            connect: {
              id: courseLevel
            }
          } : undefined
        },
        include: { materialItem: true, questions: true, submissions: true }
      })

      return {
        evaluationForm,
      };
    }),
  createTestEvalGoogleForm: protectedProcedure
    .input(z.object({
      slug: z.string(),
      levelId: z.string().optional(),
      type: z.enum(validEvalFormTypes),
      url: z.string(),
    }))
    .mutation(async ({ ctx, input: { slug, url, levelId, type } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      if (!ctx.session.user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "UNAUTHORIZED" })
      const forms = await ctx.prisma.evaluationForm.findMany({ where: { course: { slug } }, include: { course: true, courseLevel: true } })
      if (forms.some(form => (form.course?.slug === slug && type === "placementTest") || (form.courseLevel?.id === levelId && !!levelId))) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to create multible forms on the same type!" })

      const evaluationForm = await ctx.prisma.evaluationForm.create({
        data: {
          totalPoints: 0,
          type,
          course: { connect: { slug } },
          externalLink: url,
          createdBy: ctx.session.user.email,
          courseLevel: levelId ? { connect: { id: levelId } } : undefined
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
        questionText: z.string(),
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
    .mutation(async ({ ctx, input: { fields, id } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      const evaluationForm = await ctx.prisma.evaluationForm.update({
        where: { id },
        data: {
          totalPoints: fields.map(field => field.points).reduce((a, b) => a + b, 0),
          questions: {
            createMany: {
              data: fields,
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
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      const deletedEvalForms = await ctx.prisma.evaluationForm.deleteMany({
        where: { id: { in: ids } },
      })

      return { deletedEvalForms }
    }),
});

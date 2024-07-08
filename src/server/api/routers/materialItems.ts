import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { deleteFiles } from "@/lib/firebaseStorage";

export const materialItemsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const materialItems = await ctx.prisma.materialItem.findMany();

    return { materialItems };
  }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const materialItem = await ctx.prisma.materialItem.findUnique({
        where: { id },
        include: {
          course: true,
          evaluationForms: true,
          zoomSessions: true,
        }
      });
      return { materialItem };
    }),
  getByCourseId: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ ctx, input: { courseId } }) => {
      const materialItems = await ctx.prisma.materialItem.findMany({
        where: { courseId },
        include: { evaluationForms: true },
      });
      return { materialItems };
    }),
  dublicateMaterialItem: protectedProcedure
    .input(
      z.object({ id: z.string() })
    )
    .mutation(
      async ({ input: { id }, ctx }) => {
        const materialItem = await ctx.prisma.materialItem.findUnique({ where: { id } })
        if (!materialItem) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to dublicate this material!" })
        if (!materialItem.courseId) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to dublicate this material!" })
        if (!materialItem.manual) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to dublicate this material!" })

        const materialItemDublication = await ctx.prisma.materialItem.create({
          data: {
            type: "manual",
            course: {
              connect: { id: materialItem.courseId },
            },
            manual: {
              leadinText: materialItem.manual?.leadinText!,
              leadinImageUrl: materialItem.manual?.leadinImageUrl!,
              firstTestTitle: materialItem.manual?.firstTestTitle!,
              title: materialItem.manual?.title!,
              subTitle: materialItem.manual?.subTitle!,
              answerCards: materialItem.manual?.answerCards,
              answerAreas: materialItem.manual?.answerAreas,
              vocabularyCards: materialItem.manual?.vocabularyCards,
              practiceQuestions: materialItem.manual?.practiceQuestions,
            }
          },
        });

        return {
          materialItemDublication,
        };
      }
    ),
  uploadMaterialItem: protectedProcedure
    .input(z.object({
      courseId: z.string(),
      title: z.string(),
      url: z.string(),
    }))
    .mutation(async ({ ctx, input: { courseId, title, url } }) => {
      const materialItem = await ctx.prisma.materialItem.create({
        data: {
          type: "upload",
          course: {
            connect: { id: courseId },
          },
          upload: {
            title,
            url,
          },
        },
      });

      return {
        materialItem,
      };
    }),
  createMaterialItem: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        leadinText: z.string(),
        leadinImageUrl: z.string(),
        firstTestTitle: z.string(),
        title: z.string(),
        subTitle: z.string(),
        answerCards: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          })
        ),
        answerAreas: z.array(
          z.object({
            img: z.string(),
            card: z
              .object({
                id: z.string(),
                text: z.string(),
              })
              .nullable(),
            correctAnswer: z.string(),
          })
        ),
        vocabularyCards: z.array(
          z.object({
            word: z.string(),
            context: z.string(),
            example: z.string(),
            images: z.object({ front: z.string(), back: z.string() }),
          })
        ),
        practiceQuestions: z.array(
          z.object({
            id: z.string(),
            question: z.string(),
            choices: z.array(z.string()),
            correctAnswer: z.string(),
            studentAnswer: z.string(),
          })
        ),
      })
    )
    .mutation(
      async ({
        input: {
          answerAreas,
          answerCards,
          firstTestTitle,
          leadinImageUrl,
          leadinText,
          courseId,
          practiceQuestions,
          subTitle,
          title,
          vocabularyCards,
        },
        ctx,
      }) => {
        const materialItem = await ctx.prisma.materialItem.create({
          data: {
            type: "manual",
            course: {
              connect: { id: courseId },
            },
            manual: {
              leadinText,
              leadinImageUrl,
              firstTestTitle,
              title,
              subTitle,
              answerCards,
              answerAreas,
              vocabularyCards,
              practiceQuestions: practiceQuestions.map((q) => ({
                ...q,
                type: "ControlledPracticeMultichoiceQuestion",
              }))
            },
          },
        });

        return {
          materialItem,
        };
      }
    ),
  editMaterialItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        leadinText: z.string(),
        leadinImageUrl: z.string(),
        firstTestTitle: z.string(),
        title: z.string(),
        subTitle: z.string(),
        answerCards: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          })
        ),
        answerAreas: z.array(
          z.object({
            img: z.string(),
            card: z
              .object({
                id: z.string(),
                text: z.string(),
              })
              .nullable(),
            correctAnswer: z.string(),
          })
        ),
        vocabularyCards: z.array(
          z.object({
            word: z.string(),
            context: z.string(),
            example: z.string(),
            images: z.object({ front: z.string(), back: z.string() }),
          })
        ),
        practiceQuestions: z.array(
          z.object({
            id: z.string(),
            question: z.string(),
            choices: z.array(z.string()),
            correctAnswer: z.string(),
            studentAnswer: z.string(),
          })
        ),
      })
    )
    .mutation(
      async ({
        ctx,
        input: {
          id,
          answerAreas,
          answerCards,
          firstTestTitle,
          leadinImageUrl,
          leadinText,
          practiceQuestions,
          subTitle,
          title,
          vocabularyCards,
        },
      }) => {
        const updatedmaterialItem = await ctx.prisma.materialItem.update({
          where: {
            id,
          },
          data: {
            manual: {
              leadinText,
              leadinImageUrl,
              firstTestTitle,
              title,
              subTitle,
              answerCards,
              answerAreas,
              vocabularyCards,
              practiceQuestions: practiceQuestions.map((q) => ({
                ...q,
                type: "ControlledPracticeMultichoiceQuestion",
              }))
            },
          },
        });

        return { updatedmaterialItem };
      }
    ),
  deleteMaterialItems: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })

      const toBeDeleted = await ctx.prisma.materialItem.findMany({ where: { id: { in: input } } })
      if (toBeDeleted.some(item => item.type === "upload")) {
        toBeDeleted.filter(item => !!item.upload).map(item => {
          deleteFiles(`uploads/content/courses/${item.courseId}/${item.upload?.title}`)
        })
      }

      const deletedMaterialItems = await ctx.prisma.materialItem.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });


      return { deletedMaterialItems };
    }),
});

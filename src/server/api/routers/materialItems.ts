import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
      });
      return { materialItem };
    }),
  getByLessonId: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      })
    )
    .query(async ({ ctx, input: { lessonId } }) => {
      const materialItems = await ctx.prisma.materialItem.findMany({
        where: { lessonId },
      });
      return { materialItems };
    }),
  createMaterialItem: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
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
          lessonId,
          practiceQuestions,
          subTitle,
          title,
          vocabularyCards,
        },
        ctx,
      }) => {
        const materialItem = await ctx.prisma.materialItem.create({
          data: {
            leadinText,
            leadinImageUrl,
            firstTestTitle,
            title,
            subTitle,
            frameWorkName: "TTT vocab",
            answerCards,
            answerAreas,
            lesson: {
              connect: { id: lessonId },
            },
            vocabularyCards,
            practiceQuestions: practiceQuestions.map((q) => ({
              ...q,
              type: "ControlledPracticeMultichoiceQuestion",
            })),
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
            })),
          },
        });

        return { updatedmaterialItem };
      }
    ),
  deleteMaterialItems: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
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

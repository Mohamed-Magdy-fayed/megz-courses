import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { deleteFiles } from "@/lib/firebaseStorage";
import { Prisma } from "@prisma/client";

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
          evaluationForms: true,
          zoomSessions: true,
        }
      });
      return { materialItem };
    }),
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input: { slug } }) => {
      const materialItem = await ctx.prisma.materialItem.findFirst({
        where: { slug },
        include: {
          evaluationForms: true,
          zoomSessions: true,
          courseLevel: { include: { course: true } },
        }
      });
      return { materialItem };
    }),
  getBycourseLevelId: protectedProcedure
    .input(
      z.object({
        courseLevelId: z.string(),
      })
    )
    .query(async ({ ctx, input: { courseLevelId } }) => {
      const materialItems = await ctx.prisma.materialItem.findMany({
        where: { courseLevelId },
        include: { evaluationForms: true },
      });
      return { materialItems };
    }),
  getByCourseSlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input: { slug } }) => {
      const materialItems = await ctx.prisma.materialItem.findMany({
        where: { courseLevel: { course: { slug } } },
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
        if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
        const materialItem = await ctx.prisma.materialItem.findUnique({ where: { id } })
        if (!materialItem) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to dublicate this material!" })
        if (!materialItem.courseLevelId) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to dublicate this material!" })

        const data: Prisma.MaterialItemCreateArgs["data"] = materialItem.type === "manual"
          ? {
            title: materialItem.title,
            subTitle: materialItem.subTitle,
            type: "manual",
            courseLevel: {
              connect: { id: materialItem.courseLevelId },
            },
            manual: {
              leadinText: materialItem.manual?.leadinText || "",
              leadinImageUrl: materialItem.manual?.leadinImageUrl || "",
              firstTestTitle: materialItem.manual?.firstTestTitle || "",
              answerCards: materialItem.manual?.answerCards,
              answerAreas: materialItem.manual?.answerAreas,
              vocabularyCards: materialItem.manual?.vocabularyCards,
              practiceQuestions: materialItem.manual?.practiceQuestions,
            },
            slug: materialItem.slug,
          }
          : {
            title: materialItem.title,
            subTitle: materialItem.subTitle,
            type: "upload",
            courseLevel: {
              connect: { id: materialItem.courseLevelId },
            },
            uploads: materialItem.uploads,
            slug: materialItem.slug,
          }

        const materialItemDublication = await ctx.prisma.materialItem.create({
          data,
        });

        return {
          materialItemDublication,
        };
      }
    ),
  uploadMaterialItem: protectedProcedure
    .input(z.object({
      title: z.string(),
      subTitle: z.string(),
      slug: z.string(),
      levelSlug: z.string(),
      uploads: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input: { title, subTitle, slug, levelSlug, uploads } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      const materialItem = await ctx.prisma.materialItem.create({
        data: {
          title,
          subTitle,
          slug,
          type: "upload",
          courseLevel: {
            connect: { slug: levelSlug },
          },
          uploads,
        },
      });

      return {
        materialItem,
      };
    }),
  checkMaterialItem: protectedProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .mutation(async ({ ctx, input: { slug } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      const materialItem = await ctx.prisma.materialItem.findUnique({
        where: { slug }
      });

      return {
        exists: materialItem ? true : false,
      };
    }),
  editUploadMaterialItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
      subTitle: z.string(),
      slug: z.string(),
      levelSlug: z.string(),
    }))
    .mutation(async ({ ctx, input: { id, title, subTitle, slug, levelSlug } }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      await ctx.prisma.materialItem.update({ where: { id }, data: { courseLevel: { disconnect: true } } })

      const materialItem = await ctx.prisma.materialItem.update({
        where: {
          id,
        },
        data: {
          title,
          subTitle,
          slug,
          courseLevel: {
            connect: { slug: levelSlug },
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
        courseLevelId: z.string(),
        leadinText: z.string(),
        leadinImageUrl: z.string(),
        firstTestTitle: z.string(),
        title: z.string(),
        slug: z.string(),
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
          courseLevelId,
          practiceQuestions,
          subTitle,
          title,
          slug,
          vocabularyCards,
        },
        ctx,
      }) => {
        if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
        const materialItem = await ctx.prisma.materialItem.create({
          data: {
            title,
            subTitle,
            type: "manual",
            slug,
            courseLevel: {
              connect: { id: courseLevelId },
            },
            manual: {
              leadinText,
              leadinImageUrl,
              firstTestTitle,
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
        slug: z.string(),
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
          slug,
          vocabularyCards,
        },
      }) => {
        if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
        const updatedmaterialItem = await ctx.prisma.materialItem.update({
          where: {
            id,
          },
          data: {
            title,
            slug,
            subTitle,
            manual: {
              leadinText,
              leadinImageUrl,
              firstTestTitle,
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

      const toBeDeleted = await ctx.prisma.materialItem.findMany({ where: { id: { in: input } }, include: { courseLevel: { include: { course: true } } } })
      if (toBeDeleted.some(item => item.type === "upload")) {
        toBeDeleted.filter(item => item.uploads.length > 0).map(item => {
          deleteFiles(`uploads/content/courses/${item.courseLevel?.course.slug}/${item.courseLevel?.slug}/${item.slug}`)
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

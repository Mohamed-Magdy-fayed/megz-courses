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
  createMaterialItem: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.string(),
        fileType: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const materialItem = await ctx.prisma.materialItem.create({
        data: {
          name: input.name,
          url: input.name,
          size: input.name,
          fileType: input.name,
          lessonId: input.lessonId,
        },
      });

      return {
        materialItem,
      };
    }),
  editMaterialItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        size: z.string(),
        fileType: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(
      async ({ ctx, input: { id, name, fileType, lessonId, size, url } }) => {
        const updatedmaterialItem = await ctx.prisma.materialItem.update({
          where: {
            id,
          },
          data: {
            name,
            fileType,
            lessonId,
            size,
            url,
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

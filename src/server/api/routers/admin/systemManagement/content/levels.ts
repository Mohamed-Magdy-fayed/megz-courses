import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";

export const levelsRouter = createTRPCRouter({
  getWaitingLists: protectedProcedure
    .query(async ({ ctx }) => {
      const levels = await ctx.prisma.courseLevel.findMany({
        include: { courseStatus: true }
      });

      const coursesWaitingUsers = await Promise.all(levels.map(async (level) => {
        const userIds = level?.courseStatus.map(s => s.userId || "")

        const users = await ctx.prisma.user.findMany({
          where: { id: { in: userIds } },
          include: { courseStatus: true }
        })

        const watingUsers = users.filter(user => user.courseStatus.some(({ courseLevelId, status }) => courseLevelId === level?.id && status === "Waiting"))
        return {
          courseId: level.id,
          waitingList: watingUsers.length,
        }
      }))


      return { coursesWaitingUsers };
    }),
  getAll: protectedProcedure
    .input(z.object({
      where: z.object({
        id: z.object({
          in: z.array(z.string())
        })
      })
    }).optional())
    .query(async ({ ctx, input }) => {
      const levels = await ctx.prisma.courseLevel.findMany({
        where: input?.where,
        include: { courseStatus: { include: { user: true } } },
        orderBy: [{ levelOrder: "asc" }, { createdAt: "asc" }]
      });

      return { levels };
    }),
  getByIdSimple: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      return await ctx.prisma.courseLevel.findUnique({ where: { id } });
    }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const level = await ctx.prisma.courseLevel.findUnique({
        where: { id },
        include: {
          zoomGroups: true,
          certificates: true,
          course: true,
          courseStatus: true,
          systemForms: true,
        },
      });
      return { level };
    }),
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        courseSlug: z.string(),
      })
    )
    .query(async ({ ctx, input: { slug, courseSlug } }) => {
      const course = await ctx.prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true } })
      if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

      const level = await ctx.prisma.courseLevel.findUnique({
        where: { courseId_slug: { courseId: course.id, slug } },
        include: {
          zoomGroups: true,
          certificates: true,
          course: true,
          courseStatus: true,
          systemForms: { include: { items: { include: { questions: { include: { options: true } } } }, submissions: true } },
          materialItems: { include: { systemForms: { include: { items: { include: { questions: { include: { options: true } } } } } } } },
        },
      });
      return { level };
    }),
  getByCourseId: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ ctx, input: { courseId } }) => {
      const levels = await ctx.prisma.courseLevel.findMany({
        where: {
          course: {
            id: courseId
          }
        },
        include: { courseStatus: { include: { user: true } } },
        orderBy: [{ levelOrder: "asc" }, { createdAt: "asc" }],
      });
      return { levels };
    }),
  getByCourseSlug: protectedProcedure
    .input(
      z.object({
        courseSlug: z.string(),
      })
    )
    .query(async ({ ctx, input: { courseSlug } }) => {
      const levels = await ctx.prisma.courseLevel.findMany({
        where: {
          course: {
            slug: courseSlug
          }
        },
        include: {
          zoomGroups: true,
          certificates: true,
          course: true,
          courseStatus: true,
          systemForms: { include: { items: true, submissions: true } },
          materialItems: { include: { systemForms: true } },
        },
        orderBy: [{ levelOrder: "asc" }, { createdAt: "asc" }],
      });
      return { levels };
    }),
  createLevel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        courseSlug: z.string(),
        levelOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ input: {
      name,
      slug,
      courseSlug,
      levelOrder,
    }, ctx }) => {
      if (!hasPermission(ctx.session.user, "courses", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const course = await ctx.prisma.course.findUnique({
        where: { slug: courseSlug },
        include: { levels: { orderBy: { levelOrder: "desc" }, select: { levelOrder: true } } },
      })
      if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

      const maxOrder = course.levels[0]?.levelOrder ?? -1
      const desiredOrder = Math.min(Math.max(0, levelOrder), maxOrder + 1)

      await ctx.prisma.courseLevel.updateMany({
        where: {
          courseId: course.id,
          levelOrder: { gte: desiredOrder },
        },
        data: {
          levelOrder: { increment: 1 },
        },
      })

      const level = await ctx.prisma.courseLevel.create({
        data: {
          name,
          slug,
          levelOrder: desiredOrder,
          course: {
            connect: {
              slug: courseSlug,
            }
          }
        },
      });

      return {
        level,
      };
    }),
  importLevels: protectedProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          slug: z.string(),
          courseSlug: z.string(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.session.user, "courses", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const courses = await ctx.prisma.course.findMany({
        where: { slug: { in: Array.from(new Set(input.map(item => item.courseSlug))) } },
        include: { levels: { orderBy: { levelOrder: "desc" }, select: { levelOrder: true } } },
      })

      const nextOrderBySlug = new Map<string, number>(
        courses.map(course => [course.slug, (course.levels[0]?.levelOrder ?? -1) + 1])
      )

      const levels = await ctx.prisma.$transaction([
        ...input.map(({ courseSlug, name, slug }) => {
          const nextOrder = nextOrderBySlug.get(courseSlug) ?? 0
          nextOrderBySlug.set(courseSlug, nextOrder + 1)

          return ctx.prisma.courseLevel.create({
            data: {
              name,
              slug,
              levelOrder: nextOrder,
              course: {
                connect: {
                  slug: courseSlug,
                }
              }
            },
          })
        })
      ]);

      return {
        levels,
      };
    }),
  editLevel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        levelOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input: { name, slug, id, levelOrder } }) => {
      if (!hasPermission(ctx.session.user, "courses", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const currentLevel = await ctx.prisma.courseLevel.findUnique({
        where: { id },
        select: { id: true, courseId: true, levelOrder: true },
      })
      if (!currentLevel) throw new TRPCError({ code: "BAD_REQUEST", message: "Level not found!" })

      const totalLevels = await ctx.prisma.courseLevel.count({ where: { courseId: currentLevel.courseId } })
      const currentOrder = currentLevel.levelOrder ?? 0
      const desiredOrder = Math.min(Math.max(0, levelOrder), Math.max(0, totalLevels - 1))

      if (desiredOrder > currentOrder) {
        await ctx.prisma.courseLevel.updateMany({
          where: {
            courseId: currentLevel.courseId,
            id: { not: id },
            levelOrder: { gte: currentOrder + 1, lte: desiredOrder },
          },
          data: {
            levelOrder: { decrement: 1 },
          },
        })
      } else if (desiredOrder < currentOrder) {
        await ctx.prisma.courseLevel.updateMany({
          where: {
            courseId: currentLevel.courseId,
            id: { not: id },
            levelOrder: { gte: desiredOrder, lte: currentOrder - 1 },
          },
          data: {
            levelOrder: { increment: 1 },
          },
        })
      }

      const updatedLevel = await ctx.prisma.courseLevel.update({
        where: { id },
        data: {
          name,
          slug,
          levelOrder: desiredOrder,
        },
      })

      return { updatedLevel };
    }),
  deleteLevels: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.session.user, "courses", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
      const deletedLevels = await ctx.prisma.courseLevel.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });

      return { deletedLevels };
    }),
});

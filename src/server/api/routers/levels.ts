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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const levels = await ctx.prisma.courseLevel.findMany({
      include: { courseStatus: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    });

    return { levels };
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
      });
      return { levels };
    }),
  createLevel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        courseSlug: z.string(),
      })
    )
    .mutation(async ({ input: {
      name,
      slug,
      courseSlug,
    }, ctx }) => {
      if (!hasPermission(ctx.session.user, "courses", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
      const level = await ctx.prisma.courseLevel.create({
        data: {
          name,
          slug,
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

      const levels = await ctx.prisma.$transaction([
        ...input.map(({ courseSlug, name, slug }) => ctx.prisma.courseLevel.create({
          data: {
            name,
            slug,
            course: {
              connect: {
                slug: courseSlug,
              }
            }
          },
        }))
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
      })
    )
    .mutation(async ({ ctx, input: { name, slug, id } }) => {
      if (!hasPermission(ctx.session.user, "courses", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
      const updatedLevel = await ctx.prisma.courseLevel.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
        },
      });

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

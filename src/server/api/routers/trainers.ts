import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { addMinutes, subMinutes } from "date-fns";
import { env } from "@/env.mjs";
import { validUserRoles } from "@/lib/enumsTypes";
import { hasPermission } from "@/server/permissions";

export const trainersRouter = createTRPCRouter({
  getTrainers: publicProcedure
    .query(async ({ ctx }) => {
      const [teachers, testers] = await ctx.prisma.$transaction([
        ctx.prisma.teacher.findMany({
          orderBy: {
            id: "desc"
          },
          include: {
            user: true,
            groups: true,
          },
        }),
        ctx.prisma.tester.findMany({
          orderBy: {
            id: "desc"
          },
          include: {
            user: true,
            assignedTests: true,
          },
        })
      ]);

      return { trainers: [...teachers, ...testers] };
    }),
  getTeachers: publicProcedure
    .query(async ({ ctx }) => {
      const teachers = await ctx.prisma.teacher.findMany({
        orderBy: {
          id: "desc"
        },
        include: {
          user: true,
          groups: true,
        },
      })

      return { teachers };
    }),
  getTesters: publicProcedure
    .query(async ({ ctx }) => {
      const testers = await ctx.prisma.tester.findMany({
        orderBy: {
          id: "desc"
        },
        include: {
          user: true,
          assignedTests: true,
        },
      })

      return { testers };
    }),
  getAvialableTesters: protectedProcedure
    .input(z.object({
      startTime: z.date()
    }))
    .query(async ({ ctx, input: { startTime } }) => {
      const placementTestTime = parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME || "0", 10);

      // Calculate the acceptable time range:
      // 1. Lower bound: startTime - PLACEMENT_TEST_TIME minutes
      // 2. Upper bound: startTime + PLACEMENT_TEST_TIME minutes
      const lowerBoundTime = subMinutes(startTime, placementTestTime);
      const upperBoundTime = addMinutes(startTime, placementTestTime);

      const trainers = await ctx.prisma.tester.findMany({
        where: {
          assignedTests: {
            none: {
              // Ensure that no test overlaps with the given startTime, considering PLACEMENT_TEST_TIME in minutes
              oralTestTime: {
                gte: lowerBoundTime, // No test Starting after this time (margin before startTime)
                lte: upperBoundTime, // No test ending after this time (margin after startTime)
              }
            }
          }
        },
        orderBy: {
          id: "desc"
        },
        include: {
          user: true,
          assignedTests: true,
        },
      });

      return { trainers };

    }),
  getCurrentTrainer: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      let trainer = await ctx.prisma.teacher.findFirst({
        where: { userId: id },
        include: { user: true },
      });

      if (!trainer) {
        trainer = await ctx.prisma.tester.findFirst({
          where: { userId: id },
          include: { user: true },
        });
      }

      return { trainer };
    }),
  getCurrentTrainerSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const trainer = await ctx.prisma.teacher.findFirst({
        where: { userId: id },
        include: { user: true, groups: { include: { zoomSessions: { include: { zoomGroup: true, materialItem: true } } } } },
      });
      if (!trainer) throw new TRPCError({ code: "BAD_REQUEST", message: "Trainer not found!" })

      const sessions = await ctx.prisma.zoomSession.findMany({
        where: { zoomGroup: { teacherId: trainer.id } },
        orderBy: { sessionDate: "desc" },
        include: {
          zoomGroup: { include: { teacher: { include: { user: true } } } },
          materialItem: true
        }
      })

      return { sessions };
    }),
  getAllSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const sessions = await ctx.prisma.zoomSession.findMany({
        orderBy: { sessionDate: "desc" },
        include: {
          zoomGroup: { include: { teacher: { include: { user: true } } } },
          materialItem: true
        }
      })

      return { sessions };
    }),
  getTrainerPlacementTest: protectedProcedure
    .query(async ({ ctx }) => {
      const tests = await ctx.prisma.placementTest.findMany({
        where: { tester: { userId: ctx.session.user.id } },
        include: {
          student: { include: { courseStatus: { include: { level: true } } } },
          course: { include: { levels: true } },
          writtenTest: { include: { submissions: true } },
          createdBy: true,
        }
      })

      return { tests }
    }),
  createTrainer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        phone: z.string(),
        image: z.string().optional(),
        trainerRole: z.enum([validUserRoles[4], validUserRoles[5]]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // check if email is taken
      const exists = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });
      if (exists) throw new Error("Email already used!");

      const trainer = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          emailVerified: new Date(),
          hashedPassword,
          phone: input.phone.replace("+", ""),
          image: input.image,
          userRoles: [input.trainerRole],
          teacher: input.trainerRole === "Teacher" ? {
            create: {}
          } : undefined,
          tester: input.trainerRole === "Tester" ? {
            create: {}
          } : undefined,
        },
      });

      return {
        trainer,
      };
    }),
  editTrainer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        image: z.string().optional(),
        trainerRole: z.enum([validUserRoles[4], validUserRoles[5]]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const exists = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });
      if (exists?.id !== input.id && input.email === exists?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already used!" });

      const trainer = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone.replace("+", ""),
          image: input.image,
          userRoles: [input.trainerRole],
          teacher: input.trainerRole === "Teacher" ? {
            connectOrCreate: { where: { userId: input.id }, create: {} }
          } : undefined,
          tester: input.trainerRole === "Tester" ? {
            connectOrCreate: { where: { userId: input.id }, create: {} }
          } : undefined,
        },
      });

      return {
        trainer,
      };
    }),
  deleteTrainer: adminProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.session.user, "users", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
      const [deletedTeachers, deletedTrainers, deletedUsers] = await ctx.prisma.$transaction([
        ctx.prisma.teacher.deleteMany({
          where: {
            userId: {
              in: input,
            },
          },
        }),
        ctx.prisma.tester.deleteMany({
          where: {
            userId: {
              in: input,
            },
          },
        }),
        ctx.prisma.user.deleteMany({
          where: {
            id: {
              in: input,
            },
          },
        })
      ])

      return { deletedTeachers, deletedTrainers, deletedUsers };
    }),
});

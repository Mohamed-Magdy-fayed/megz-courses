import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { validTrainerRoles } from "@/lib/enumsTypes";
import { addMinutes, subMinutes } from "date-fns";
import { env } from "@/env.mjs";

export const trainersRouter = createTRPCRouter({
  getTrainers: publicProcedure
    .query(async ({ ctx }) => {
      const trainers = await ctx.prisma.trainer.findMany({
        orderBy: {
          id: "desc"
        },
        include: {
          user: true,
          groups: true,
        },
      });

      return { trainers };
    }),
  getAvialableTesters: protectedProcedure
    .input(z.object({
      startTime: z.date()
    }))
    .query(async ({ ctx, input: { startTime } }) => {
      // Retrieve the env variable and parse it to an integer (test duration in minutes)
      const placementTestTime = parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME || "0", 10);

      // Calculate the acceptable time range:
      // 1. Lower bound: startTime - PLACEMENT_TEST_TIME minutes
      // 2. Upper bound: startTime + PLACEMENT_TEST_TIME minutes
      const lowerBoundTime = subMinutes(startTime, placementTestTime);
      const upperBoundTime = addMinutes(startTime, placementTestTime);

      const trainers = await ctx.prisma.trainer.findMany({
        where: {
          role: "tester",
          assignedTests: {
            none: {
              // Ensure that no test overlaps with the given startTime, considering PLACEMENT_TEST_TIME in minutes
              oralTestTime: {
                gte: lowerBoundTime, // No test starting after this time (margin before startTime)
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
          groups: true,
        },
      });

      return { trainers };

    }),
  getTrainerById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const trainer = await ctx.prisma.user.findFirst({
        where: { trainerId: id },
        include: { trainer: true },
      });
      return { trainer };
    }),
  getCurrentTrainer: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const trainer = await ctx.prisma.trainer.findFirst({
        where: { userId: id },
        include: { user: true },
      });

      return { trainer };
    }),
  getCurrentTrainerSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const trainer = await ctx.prisma.trainer.findFirst({
        where: { userId: id },
        include: { user: true, groups: { include: { zoomSessions: { include: { zoomGroup: true, materialItem: true } } } } },
      });
      if (!trainer) throw new TRPCError({ code: "BAD_REQUEST", message: "Trainer not found!" })

      const sessions = await ctx.prisma.zoomSession.findMany({
        where: { zoomGroup: { trainerId: trainer.id } },
        orderBy: { sessionDate: "desc" },
        include: {
          zoomGroup: { include: { trainer: { include: { user: true } } } },
          materialItem: true
        }
      })

      return { sessions };
    }),
  createTrainer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        image: z.string().optional(),
        phone: z.string().optional(),
        trainerRole: z.enum(validTrainerRoles),
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
          phone: input.phone,
          image: input.image,
          userType: "teacher",
          trainer: {
            create: {
              role: input.trainerRole || "teacher",
            }
          }
        },
      });

      return {
        trainer,
      };
    }),
  deleteTrainer: adminProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      await ctx.prisma.trainer.deleteMany({
        where: {
          userId: {
            in: input,
          },
        },
      });
      const deletedTrainers = await ctx.prisma.user.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });

      return { deletedTrainers };
    }),
});

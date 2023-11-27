import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { validDeviceTypes, validTrainerRoles, validUserTypes } from "@/lib/enumsTypes";

export const trainersRouter = createTRPCRouter({
  getTrainers: protectedProcedure
    .query(async ({ ctx }) => {
      const trainers = await ctx.prisma.user.findMany({
        where: {
          userType: "teacher",
        },
        orderBy: {
          id: "desc"
        },
        include: {
          trainer: true,
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
  createTrainer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        phone: z.string().optional(),
        trainerRoll: z.enum(validTrainerRoles).optional(),
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
          hashedPassword,
          phone: input.phone,
          trainer: {
            create: {
              role: input.trainerRoll || "teacher",
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

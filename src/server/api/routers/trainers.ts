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

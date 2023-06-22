import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";

export const studentsRouter = createTRPCRouter({
  getStudents: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          cursor: z.object({ id: z.string(), createdAt: z.date() }),
        })
        .optional()
    )
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        include: { address: true },
      });

      return users.map((user) => ({
        id: user.id,
        address: {
          city: user.address?.city,
          country: user.address?.country,
          state: user.address?.state,
          street: user.address?.street,
        },
        image: user.image,
        createdAt: user.createdAt,
        email: user.email,
        name: user.name,
        phone: user.phone,
      }));
    }),
  deleteStudent: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input: { userIds }, ctx }) => {
      const deletedUsers = await ctx.prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });

      return { deletedUsers };
    }),
  createStudent: protectedProcedure
    .input(
      z.object({
        userName: z.string(),
        email: z.string().email(),
        password: z.string(),
        phone: z.string().optional(),
        image: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
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
      if (exists)
        return {
          error: { message: "Email already taken" },
        };

      const user = await ctx.prisma.user.create({
        data: {
          name: input.userName,
          email: input.email,
          hashedPassword,
          phone: input.phone,
          image: input.image,
          address: {
            create: {
              state: input.state,
              street: input.street,
              city: input.city,
              country: input.country,
            },
          },
        },
        include: {
          address: true,
        },
      });

      return {
        user,
      };
    }),
});

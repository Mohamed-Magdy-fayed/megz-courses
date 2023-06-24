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
      try {
        const users = await ctx.prisma.user.findMany({
          include: { address: true },
        });

        return {
          users,
        };
      } catch (error) {
        return { users: [] };
      }
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
        name: z.string(),
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
          name: input.name,
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
  editStudentImage: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input: { url, email } }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          image: url,
        },
        include: {
          address: true,
        },
      });

      return { updatedUser };
    }),
  editStudent: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        id: z.string(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: { name, email, phone, state, country, street, city, id },
      }) => {
        const updatedUser = await ctx.prisma.address.update({
          where: {
            userId: id,
          },
          data: {
            state,
            country,
            street,
            city,
            User: {
              update: {
                name,
                email,
                phone,
              },
            },
          },
          include: {
            User: true,
          },
        });

        return { updatedUser };
      }
    ),
});

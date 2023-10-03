import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";

export const usersRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .input(
      z.object({
        userType: z.enum(["admin", "student", "teacher", "salesAgent"]),
      })
    )
    .query(async ({ ctx, input: { userType } }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          userType,
        },
        include: {
          address: true,
          orders: true,
        },
      });

      return { users };
    }),
  getUserById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        include: { address: true, orders: true },
      });
      return { user };
    }),
  getUserByEmail: publicProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ input: { email }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
        include: { address: true, orders: true },
      });

      return { user };
    }),
  createUser: protectedProcedure
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
        userType: z.enum(["admin", "student", "teacher"]).optional(),
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
          userType: input.userType,
        },
        include: {
          address: true,
        },
      });

      return {
        user,
      };
    }),
  editUserImage: protectedProcedure
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
  editUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: { name, email, phone, state, country, street, city },
      }) => {
        const updatedUser = await ctx.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            name,
            email,
            phone,
            address: {
              update: {
                state,
                country,
                street,
                city,
              },
            },
          },
          include: {
            address: true,
          },
        });

        return { updatedUser };
      }
    ),
  deleteUser: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const deletedUsers = await ctx.prisma.user.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });

      return { deletedUsers };
    }),
});

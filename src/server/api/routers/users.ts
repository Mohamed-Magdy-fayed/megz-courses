import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

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
        orderBy: {
          id: "desc"
        },
        include: {
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
        include: { orders: true },
      });
      return { user };
    }),
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        include: { orders: true },
      });
      return { user };
    }),
  getUserByEmail: protectedProcedure
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
        include: { orders: true },
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
            state: input.state,
            street: input.street,
            city: input.city,
            country: input.country,
          },
          userType: input.userType || "student",
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
      if (ctx.session.user.userType !== "admin"
        && ctx.session.user.email !== email) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const updatedUser = await ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          image: url,
        },
      });

      return { updatedUser };
    }),
  editUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().optional(),
        userType: z.enum(["admin", "student", "teacher", "salesAgent", "chatAgent"]).optional(),
        phone: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        device: z.enum(["mobile", "desktop", "tablet"]).optional(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: { name, email, password, userType, phone, state, country, street, city, device },
      }) => {
        if (ctx.session.user.userType !== "admin"
          && ctx.session.user.email !== email) {
          throw new TRPCError({ code: "UNAUTHORIZED" })
        }

        const updateOptions: Prisma.UserUpdateArgs = {
          where: {
            email: email,
          },
          data: {
            name,
            email,
            phone,
            address: {
              state,
              country,
              street,
              city,
            },
            device,
          },
        }

        if (ctx.session.user.userType === "admin" && password) {
          const hashedPassword = await bcrypt.hash(password, 10)
          updateOptions.data.hashedPassword = hashedPassword
        }

        if (ctx.session.user.userType === "admin" && userType) {
          updateOptions.data.userType = userType
        }

        const updatedUser = await ctx.prisma.user.update(updateOptions);

        return { updatedUser };
      }
    ),
  deleteUser: adminProcedure
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

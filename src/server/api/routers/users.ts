import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { validDeviceTypes, validUserTypes } from "@/lib/enumsTypes";

export const usersRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .input(
      z.object({
        userType: z.enum(validUserTypes),
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
  getRetintionsUsers: protectedProcedure
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          AND: {
            userType: "student",
            courseStatus: {
              some: {
                state: "completed"
              }
            }
          }

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
        include: { orders: true, evaluationFormSubmissions: true, zoomGroups: { include: { zoomSessions: true } } },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "didn't find user" })
      return { user };
    }),
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        include: { orders: true, evaluationFormSubmissions: true, zoomGroups: { include: { zoomSessions: true } } },
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
        userType: z.enum(validUserTypes).optional(),
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
        userType: z.enum(validUserTypes).optional(),
        phone: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        device: z.enum(validDeviceTypes).optional(),
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

        const user = await ctx.prisma.user.findUnique({ where: { email } })
        if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found" })

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
            userType,
            trainer: userType === "teacher" ? {
              connectOrCreate: { where: { userId: user.id }, create: { role: "teacher" } }
            } : undefined
          },
        }

        if (ctx.session.user.userType === "admin" && password) {
          const hashedPassword = await bcrypt.hash(password, 10)
          updateOptions.data.hashedPassword = hashedPassword
        }

        if (ctx.session.user.userType === "admin" && userType) {
          updateOptions.data.userType = userType
          updateOptions.data.trainer = user.userType === "student" && userType === "teacher" ? {
            connectOrCreate: { where: { userId: user.id }, create: { role: "teacher" } }
          } : undefined
        }

        const updatedUser = await ctx.prisma.user.update(updateOptions);

        return { updatedUser };
      }
    ),
  deleteUser: adminProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
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

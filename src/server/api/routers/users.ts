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
import { env } from "@/env.mjs";

export const usersRouter = createTRPCRouter({
  queryUsers: protectedProcedure
    .input(
      z.object({
        userName: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { userName } }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          name: {
            contains: userName,
            mode: "insensitive",
          },
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
          zoomGroups: { include: { zoomSessions: true } },
          evaluationFormSubmissions: true,
          courseStatus: true
        },
      });

      return { users };
    }),
  getRetintionsUsers: protectedProcedure
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          userType: "student",
          courseStatus: {
            some: {
              status: "completed"
            }
          }
        },
        orderBy: {
          id: "desc"
        },
        include: {
          orders: true,
          zoomGroups: { include: { zoomSessions: true } },
          evaluationFormSubmissions: true,
          courseStatus: { include: { course: true, level: true } },
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
        include: {
          orders: { include: { course: { include: { levels: true, orders: { include: { user: true } } } } } },
          evaluationFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: true, trainer: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
          placementTests: {
            include: {
              trainer: { include: { user: true } },
              course: { include: { levels: true } },
              student: { include: { courseStatus: { include: { level: true } } } },
              writtenTest: { include: { submissions: true } }
            }
          },
          studentNotes: { include: { createdByUser: true, mentions: true } },
          courseStatus: true,
          certificates: { include: { course: true, courseLevel: true, user: true } }
        },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "didn't find user" })
      return { user };
    }),
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const user = await ctx.prisma.user.findUnique({
        where: { id },

        include: {
          orders: { include: { course: { include: { levels: true, orders: { include: { user: true } } } }, salesOperation: { include: { assignee: true } }, user: true } },
          evaluationFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: true, trainer: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
          placementTests: {
            include: {
              trainer: { include: { user: true } },
              course: { include: { levels: true } },
              student: { include: { courseStatus: { include: { level: true } } } },
              writtenTest: { include: { submissions: true } }
            }
          },
          studentNotes: { include: { createdByUser: true, mentions: true } },
          courseStatus: { include: { level: true, course: true } },
          certificates: { include: { course: true, courseLevel: true, user: true } },
        },
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
        include: {
          orders: { include: { course: { include: { orders: { include: { user: true } } } } } },
          studentNotes: { include: { createdByUser: true, mentions: true } },
          placementTests: {
            include: {
              trainer: { include: { user: true } },
              writtenTest: { include: { submissions: true } },
              course: true,
              student: true,
            }
          },
          evaluationFormSubmissions: true,
          zoomGroups: {
            include: {
              trainer: { include: { user: true } },
              course: true,
              students: true,
              zoomSessions: true,
            }
          }
        },
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
          emailVerified: new Date(),
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
  importUsers: protectedProcedure
    .input(
      z.object({
        usersData: z.array(z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string(),
        })),
        userType: z.enum(validUserTypes),
        role: z.enum(validTrainerRoles).optional(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { usersData, userType, role, password }, ctx }) => {
      const hashedPassword = await bcrypt.hash(password, 10);

      const checkedUsers = await Promise.all(
        usersData.map(async (user, i) => {
          const exists = await ctx.prisma.user.findFirst({
            where: {
              email: user.email,
            },
          });
          if (!!exists) return { lineNumber: i + 1, exists: true, ...user }
          return { lineNumber: i + 1, exists: false, ...user }
        })
      )

      const errors = checkedUsers.filter(u => u.exists)
      if (checkedUsers.filter(u => !u.exists).length === 0) return {
        errors,
        users: [],
      }

      const users = await ctx.prisma.$transaction([
        ...checkedUsers.filter(u => !u.exists).map(user => (
          ctx.prisma.user.create({
            data: {
              email: user.email,
              phone: user.phone,
              name: user.name,
              userType,
              emailVerified: new Date(),
              hashedPassword,
              chatAgent: userType === "chatAgent" ? { create: {} } : undefined,
              trainer: role && userType === "teacher" ? { create: { role } } : undefined,
              salesAgent: userType === "salesAgent" ? { create: { salary: "0" } } : undefined,
            }
          })
        )),
      ])

      return {
        users,
        errors,
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
        id: z.string(),
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
        input: { id, name, email, password, userType, phone, state, country, street, city, device },
      }) => {
        const user = await ctx.prisma.user.findUnique({ where: { id } })
        if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found" })
        if (ctx.session.user.userType !== "admin" && ctx.session.user.email !== user.email) throw new TRPCError({ code: "UNAUTHORIZED", message: "You're not authorized to take that action!" })

        const updateOptions: Prisma.UserUpdateArgs = {
          where: {
            id,
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
            } : undefined,
            emailVerified: user.email !== email ? null : undefined
          },
        }

        const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary
        const accessToken = await bcrypt.hash(user.id, 10);


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

        return {
          updatedUser,
          emailProps: user.email !== email ? {
            logoUrl: logoUrl || "",
            confirmationLink: `${env.NEXTAUTH_URL}email_conf/${user.id}?access_token=${accessToken}`,
            customerName: user.name,
            userEmail: user.email,
          } : undefined,
        };
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

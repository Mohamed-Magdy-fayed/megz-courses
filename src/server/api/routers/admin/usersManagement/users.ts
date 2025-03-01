import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { validDeviceTypes, validUserRoles, validUserScreens } from "@/lib/enumsTypes";
import { env } from "@/env.mjs";
import { hasPermission } from "@/server/permissions";

export const usersRouter = createTRPCRouter({
  queryUsers: protectedProcedure
    .input(
      z.object({
        userName: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { userName } }) => {
      if (!hasPermission(ctx.session.user, "users", "view")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
  getStudents: protectedProcedure
    .query(async ({ ctx }) => {
      if (!hasPermission(ctx.session.user, "users", "view")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const users = await ctx.prisma.user.findMany({
        where: {
          userRoles: { equals: ["Student"] },
        },
        orderBy: {
          id: "desc"
        },
        include: {
          orders: true,
          zoomGroups: { include: { zoomSessions: true } },
          systemFormSubmissions: true,
          courseStatus: true
        },
      });

      return { users };
    }),
  getUsers: protectedProcedure
    .input(
      z.object({
        userRole: z.enum(validUserRoles),
      })
    )
    .query(async ({ ctx, input: { userRole } }) => {
      if (!hasPermission(ctx.session.user, "users", "view")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const users = await ctx.prisma.user.findMany({
        where: {
          AND: [
            { userRoles: { has: userRole } },
            { NOT: { userRoles: { has: "Admin" } } },
          ]
        },
        orderBy: {
          id: "desc"
        },
        include: {
          orders: true,
          zoomGroups: { include: { zoomSessions: true } },
          systemFormSubmissions: true,
          courseStatus: true
        },
      });

      return { users };
    }),
  getRetintionsUsers: protectedProcedure
    .query(async ({ ctx }) => {
      if (!hasPermission(ctx.session.user, "users", "view")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const users = await ctx.prisma.user.findMany({
        where: {
          userRoles: { has: "Student" },
          courseStatus: {
            some: {
              status: "Completed"
            }
          }
        },
        orderBy: {
          id: "desc"
        },
        include: {
          orders: true,
          zoomGroups: { include: { zoomSessions: true } },
          systemFormSubmissions: true,
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
          systemFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: true, teacher: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
          placementTests: {
            include: {
              tester: { include: { user: true } },
              course: { include: { levels: true } },
              student: { include: { courseStatus: { include: { level: true } } } },
              writtenTest: { include: { submissions: true } },
              zoomSessions: true,
            }
          },
          studentNotes: { include: { createdByUser: true, mentions: true } },
          courseStatus: true,
          certificates: { include: { course: true, courseLevel: true, user: true } }
        },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "didn't find user" })
      if (!hasPermission(ctx.session.user, "users", "view", user)) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      return { user };
    }),
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const id = ctx.session.user.id
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        include: {
          orders: { include: { course: { include: { levels: true, orders: { include: { user: true } } } }, lead: { include: { assignee: { include: { user: true } } } }, user: true } },
          systemFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: true, teacher: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
          placementTests: {
            include: {
              tester: { include: { user: true } },
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
      if (!hasPermission(ctx.session.user, "users", "view")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          orders: { include: { course: { include: { orders: { include: { user: true } } } } } },
          studentNotes: { include: { createdByUser: true, mentions: true } },
          placementTests: {
            include: {
              tester: { include: { user: true } },
              writtenTest: { include: { submissions: true } },
              course: true,
              student: true,
            }
          },
          systemFormSubmissions: true,
          zoomGroups: {
            include: {
              teacher: { include: { user: true } },
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
        phone: z.string(),
        image: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        userRole: z.enum(validUserRoles).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.session.user, "users", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
          userRoles: [input.userRole || "Student"],
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
        userRole: z.enum(validUserRoles),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { usersData, userRole, password }, ctx }) => {
      if (!hasPermission(ctx.session.user, "users", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
              userRoles: [userRole],
              emailVerified: new Date(),
              hashedPassword,
              chatAgent: userRole === "ChatAgent" ? { create: {} } : undefined,
              teacher: userRole === "Teacher" ? { create: {} } : undefined,
              tester: userRole === "Tester" ? { create: {} } : undefined,
              SalesAgent: userRole === "SalesAgent" ? { create: {} } : undefined,
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
      if (!hasPermission(ctx.session.user, "users", "update", { email })) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
        userRoles: z.array(z.enum(validUserRoles)).optional(),
        userScreens: z.array(z.enum(validUserScreens)).optional(),
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
        input: { id, name, email, password, userScreens, userRoles, phone, state, country, street, city, device },
      }) => {
        if (!hasPermission(ctx.session.user, "users", "update", { id })) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

        const user = await ctx.prisma.user.findUnique({ where: { id } })
        if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found" })

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
            userRoles,
            userScreens,
            teacher: userRoles?.includes("Teacher") ? {
              connectOrCreate: { where: { userId: user.id }, create: {} }
            } : undefined,
            tester: userRoles?.includes("Tester") ? {
              connectOrCreate: { where: { userId: user.id }, create: {} }
            } : undefined,
            chatAgent: userRoles?.includes("ChatAgent") ? {
              connectOrCreate: { where: { userId: user.id }, create: {} }
            } : undefined,
            SalesAgent: userRoles?.includes("SalesAgent") ? {
              connectOrCreate: { where: { userId: user.id }, create: {} }
            } : undefined,
            emailVerified: user.email !== email ? null : undefined
          },
        }

        const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary
        const accessToken = await bcrypt.hash(user.id, 10);


        if (ctx.session.user.userRoles.includes("Admin") && password) {
          const hashedPassword = await bcrypt.hash(password, 10)
          updateOptions.data.hashedPassword = hashedPassword
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
  deleteUser: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.session.user, "users", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { setupDefaultMessageTemplates } from "@/lib/whatsApp";
import { validDefaultStages, validUserRoles, validUserScreens } from "@/lib/enumsTypes";
import { subscriptionTiers } from "@/lib/system";
import { env } from "@/env.mjs";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { getTotalSize } from "@/lib/firebaseStorage";
// import { LetsGo, LetsGo2, LetsGo3 } from "@/lib/mockData";
import { ROOT_EMAIL } from "@/server/constants";

export const setupRouter = createTRPCRouter({
  start: publicProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string().optional(),
        email: z.string().email(),
        password: z.string(),
        phone: z.string(),
        setupKey: z.string(),
      })
    )
    .mutation(async ({ input: { setupKey, email, name, password, phone, image }, ctx }) => {
      const license_key = (await ctx.prisma.license_key.findFirst())?.key
      if (!license_key) throw new TRPCError({ code: "NOT_FOUND", message: `Database not configured with a key! Please contact support!` })
      if (!(await bcrypt.compare(setupKey, license_key))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid setup key!" })
      if (!!(await ctx.prisma.user.findFirst({ where: { NOT: { email: ROOT_EMAIL } } }))) return { message: "Already Setup!" }

      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedRootPassword = await bcrypt.hash("Make.12", 10);

      const adminUser = await ctx.prisma.user.create({
        data: {
          name,
          email,
          image,
          hashedPassword,
          userRoles: [...validUserRoles],
          userScreens: [...validUserScreens],
          emailVerified: new Date(),
          phone,
          salesAgent: { create: {} },
        },
      });

      await ctx.prisma.user.create({
        data: {
          name: "Root",
          email: ROOT_EMAIL,
          hashedPassword: hashedRootPassword,
          userRoles: [...validUserRoles],
          emailVerified: new Date(),
          phone: "01271741743",
          salesAgent: { create: {} },
        },
      });

      const createdTemplates = await setupDefaultMessageTemplates(ctx.prisma)

      const leadStages = await ctx.prisma.leadStage.createMany({
        data: validDefaultStages.map((s, i) => ({ name: s, defaultStage: s, order: i + 1 })),
      })

      return {
        adminUser,
        createdTemplates,
        leadStages,
      }
    }),
  // reset: publicProcedure
  //   .mutation(async ({ ctx }) => {
  //     return await LetsGo(ctx.prisma)
  //   }),
  // reset2: publicProcedure
  //   .mutation(async ({ ctx }) => {
  //     return await LetsGo2(ctx.prisma)
  //   }),
  // reset3: publicProcedure
  //   .mutation(async ({ ctx }) => {
  //     return await LetsGo3(ctx.prisma)
  //   }),
  update: publicProcedure
    .input(
      z.object({
        requestedTier: z.string(),
      })
    )
    .mutation(async ({ input: { requestedTier } }) => {
      await sendZohoEmail({ email: "info@gateling.com", html: `Customer ${env.NEXT_PUBLIC_EMAIL} wants a new Tier: ${requestedTier}`, subject: "Tier update request!" })

      return {
        success: true,
      }
    }),
  getCurrentSetup: publicProcedure
    .query(async ({ ctx }) => {
      const tier = subscriptionTiers[env.TIER as keyof typeof subscriptionTiers]
      const isDebugMode = env.DEBUG
      const Admin = await ctx.prisma.user.findFirst({ where: { userRoles: { has: "Admin" } }, orderBy: { createdAt: "asc" } })

      const studentsCount = await ctx.prisma.user.count({ where: { userRoles: { has: "Student" } } })
      const adminsCount = await ctx.prisma.user.count({ where: { userRoles: { has: "OperationAgent" } } })
      const instructorsCount = await ctx.prisma.user.count({ where: { userRoles: { hasSome: ["Teacher", "Tester"] } } })
      const coursesCount = await ctx.prisma.course.count()
      const storageUsage = await getTotalSize("uploads/")

      return {
        tier,
        Admin,
        studentsCount,
        adminsCount,
        instructorsCount,
        coursesCount,
        storageUsage,
        isDebugMode,
      }
    }),
  getCurrentTier: publicProcedure
    .query(async () => {
      const tier = subscriptionTiers[env.TIER as keyof typeof subscriptionTiers]

      return {
        tier,
      }
    })
});

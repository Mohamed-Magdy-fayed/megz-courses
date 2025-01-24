import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { setupDefaultMessageTemplates } from "@/lib/whatsApp";
import { validDefaultStages, validUserRoles } from "@/lib/enumsTypes";
import { subscriptionTiers } from "@/lib/system";
import { env } from "@/env.mjs";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { getTotalSize } from "@/lib/firebaseStorage";
import { PrismaClient } from "@prisma/client";
import { LetsGo, LetsGo2 } from "@/lib/mockData";

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
      if (!!(await ctx.prisma.user.findFirst())) return { message: "Already Setup!" }

      const hashedPassword = await bcrypt.hash(password, 10);

      const adminUser = await ctx.prisma.user.create({
        data: {
          name,
          email,
          image,
          hashedPassword,
          userRoles: [...validUserRoles],
          emailVerified: new Date(),
          phone,
          SalesAgent: { create: {} },
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
  reset: publicProcedure
    .mutation(async ({ ctx }) => {
      return await LetsGo(ctx.prisma)

      const models: Array<keyof PrismaClient> = [
        "account",
        "session",
        "courseStatus",
        "user",
        "verificationToken",
        "placementTest",
        "teacher",
        "tester",
        "courseLevel",
        "course",
        "materialItem",
        "order",
        "salesAgent",
        "leadLabel",
        "leadNote",
        "leadInteraction",
        "lead",
        "leadStage",
        "message",
        "supportChat",
        "chatAgent",
        "zoomSession",
        "zoomGroup",
        "zoomClient",
        "googleClient",
        "metaClient",
        "userNote",
        "certificate",
        "siteIdentity",
        "supportTicket",
        "messageTemplate",
        "parameters",
        "systemForm",
        "systemFormItem",
        "itemQuestionOption",
        "itemQuestion",
        "systemFormSubmission",
      ]

      const resettedModels = await ctx.prisma.$transaction(
        models.map(model => (
          (ctx.prisma[model] as any).deleteMany()
        ))
      )

      return { resettedModels }
    }),
  reset2: publicProcedure
    .mutation(async ({ ctx }) => {
      return await LetsGo2(ctx.prisma)
    }),
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
      const Admin = await ctx.prisma.user.findFirst({ where: { userRoles: { has: "Admin" } }, orderBy: { createdAt: "asc" } })

      const studentsCount = (await ctx.prisma.user.findMany({ where: { userRoles: { has: "Student" } } })).length
      const adminsCount = (await ctx.prisma.user.findMany({ where: { userRoles: { has: "OperationAgent" } } })).length
      const instructorsCount = (await ctx.prisma.user.findMany({ where: { userRoles: { hasSome: ["Teacher", "Tester"] } } })).length
      const coursesCount = (await ctx.prisma.course.findMany()).length
      const storageUsage = await getTotalSize("uploads/")

      return {
        tier,
        Admin,
        studentsCount,
        adminsCount,
        instructorsCount,
        coursesCount,
        storageUsage,
      }
    }),
  getCurrentTier: publicProcedure
    .query(async ({ ctx }) => {
      const tier = subscriptionTiers[env.TIER as keyof typeof subscriptionTiers]

      return {
        tier,
      }
    })
});

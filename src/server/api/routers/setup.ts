import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

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
          userType: "admin",
          emailVerified: new Date(),
          phone,
        },
      });

      const systemUser = await ctx.prisma.user.create({
        data: {
          name: "System",
          email: "system@mail.com",
          userType: "admin",
        },
      });

      return {
        adminUser,
        systemUser,
      }
    }),
  isSetupAlready: publicProcedure
    .query(async ({ ctx }) => {
      return {
        isSetupAlready: !!(await ctx.prisma.user.findFirst({
          where: {
            userType: "admin",
          }
        }))
      }
    })
});

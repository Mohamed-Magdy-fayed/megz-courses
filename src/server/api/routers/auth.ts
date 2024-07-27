import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
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
        },
      });

      return {
        user,
      };
    }),
  resetPasswordRequest: publicProcedure
    .input(z.object({
      email: z.string()
    }))
    .mutation(async ({ input: { email }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true }
      })

      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email doesn't exist" })

      const hash = Number((Math.random() * 10).toFixed(0))
      const tempPassword = user.id.slice(hash).slice(0, 6) + (Math.random() * 100).toFixed(0)
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      await ctx.prisma.user.update({
        where: { email },
        data: { tempPassword: hashedPassword },
      })

      return { user, tempPassword }
    }),
  resetPasswordEmail: publicProcedure
    .input(z.object({
      email: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input: { email, message } }) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: env.GMAIL_EMAIL,
          pass: env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: env.GMAIL_EMAIL,
        to: email,
        subject: `Seems like you forgot your password!`,
        html: message,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "unable to send mail!" });
        }
        return info
      });

      return { email }
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        newPassword: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input: { email, newPassword } }) => {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updated = await ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          hashedPassword,
          tempPassword: undefined,
        },
        include: {
          orders: true,
        },
      });

      return { updated };
    }),
  resetPasswordWithCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
        newPassword: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input: { code, email, newPassword } }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email } })
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email is not present!" })
      if (!(await bcrypt.compare(code, user?.tempPassword!))) throw new TRPCError({ code: "UNAUTHORIZED", message: "incorrect code, please check your email!" })

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updated = await ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          hashedPassword,
          tempPassword: undefined,
        },
        include: {
          orders: true,
        },
      });

      return { updated };
    }),
  changePassword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        oldPassword: z.string(),
        newPassword: z.string(),
        newPasswordConfirmation: z.string(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: { id, oldPassword, newPassword, newPasswordConfirmation },
      }) => {
        if (newPassword !== newPasswordConfirmation) {
          throw new Error(`passwords don't match`);
        }
        const user = await ctx.prisma.user.findUnique({
          where: { id },
        });

        const checkOldPassword = await bcrypt.compare(
          oldPassword,
          user?.hashedPassword!
        );
        if (!checkOldPassword) {
          throw new Error(`incorrect old password`);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updated = await ctx.prisma.user.update({
          where: {
            id,
          },
          data: {
            hashedPassword,
          },
          include: {
            orders: true,
          },
        });

        return { updated };
      }
    ),
});

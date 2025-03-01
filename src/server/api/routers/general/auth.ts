import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { EmailsWrapper } from "@/components/emails/EmailsWrapper";
import EmailConfirmation from "@/components/emails/EmailConfirmation";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import EmailConfirmationSuccess from "@/components/emails/EmailConfirmed";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        phone: z.string(),
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
      if (exists) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already taken" })

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          hashedPassword,
          phone: input.phone,
        },
      });

      const accessToken = await bcrypt.hash(user.id, 10);
      const confirmationLink = `${env.NEXTAUTH_URL}email_conf/${user.id}?access_token=${accessToken}`

      const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary
      const html = await EmailsWrapper({
        EmailComp: EmailConfirmation,
        prisma: ctx.prisma,
        props: {
          logoUrl: logoUrl || "",
          confirmationLink,
          customerName: user.name,
          userEmail: user.email,
        }
      })
      await sendZohoEmail({ email: user.email, subject: `Confirm your email ${user.email}`, html })
      await sendWhatsAppMessage({ prisma: ctx.prisma, toNumber: user.phone, type: "ConfirmEmail", variables: { name: user.name, confirmationLink } })

      await ctx.prisma.userNote.create({
        data: {
          sla: 0,
          status: "Closed",
          title: "Email needs confirmation",
          type: "Info",
          createdForStudent: { connect: { id: user.id } },
          createdByUser: { connect: { id: user.id } },
          messages: [{
            message: `The studnet's email needs confirmation`,
            updatedAt: new Date(),
            updatedBy: "System"
          }],
        }
      })

      return {
        user,
      };
    }),
  confirmUserEmail: publicProcedure
    .input(z.object({
      id: z.string(),
      accessToken: z.string(),
    }))
    .mutation(async ({ ctx, input: { accessToken, id } }) => {
      if (!(await bcrypt.compare(id, accessToken))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid access token!" })
      if ((await ctx.prisma.user.findUnique({ where: { id } }))?.emailVerified) return { user: null }

      const user = await ctx.prisma.user.update({
        where: { id },
        data: { emailVerified: new Date() },
        select: { id: true, name: true, email: true, phone: true, emailVerified: true }
      })

      const html = await EmailsWrapper({
        EmailComp: EmailConfirmationSuccess,
        prisma: ctx.prisma,
        props: {
          accountLink: `${env.NEXTAUTH_URL}my_account`,
          customerName: user.name,
          userEmail: user.email,
        }
      })

      await sendZohoEmail({ html, email: user.email, subject: `Congratulations, your email is now verified.` })
      await sendWhatsAppMessage({ prisma: ctx.prisma, toNumber: user.phone, type: "EmailConfirmed", variables: { name: user.name } })

      return {
        user,
      }
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
      sendZohoEmail({
        email, subject: `Seems like you forgot your password!`, html: message
      })

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
        oldPassword: z.string().optional(),
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

        if (oldPassword) {
          const checkOldPassword = await bcrypt.compare(
            oldPassword,
            user?.hashedPassword!
          );
          if (!checkOldPassword) {
            throw new Error(`incorrect old password`);
          }
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

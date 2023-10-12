import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";

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

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";

export const studentsRouter = createTRPCRouter({
  createStudent: protectedProcedure
    .input(
      z.object({
        userName: z.string(),
        email: z.string().email(),
        password: z.string(),
        phone: z.string().optional(),
        image: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
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
          name: input.userName,
          email: input.email,
          hashedPassword,
          phone: input.phone,
          image: input.image,
          address: {
            create: {
              state: input.state,
              street: input.street,
              city: input.city,
              country: input.country,
            },
          },
        },
        include: {
          address: true,
        },
      });

      return {
        user,
      };
    }),
});

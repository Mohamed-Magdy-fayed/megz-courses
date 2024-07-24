import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const certificatesRouter = createTRPCRouter({
  createCertificate: protectedProcedure
    .input(z.object({
      studentId: z.string(),
      courseSlug: z.string(),
      levelSlug: z.string(),
      certificateId: z.string(),
      completionDate: z.date(),
    }))
    .mutation(async ({ ctx, input: { certificateId, completionDate, courseSlug, levelSlug, studentId } }) => {
      const certificate = await ctx.prisma.certificate.create({
        data: {
          certificateId,
          completionDate,
          course: { connect: { slug: courseSlug } },
          courseLevel: { connect: { slug: levelSlug } },
          user: { connect: { id: studentId } }
        }
      })

      return {
        certificate,
      };
    }),
  getCertificate: protectedProcedure
    .input(z.object({
      courseSlug: z.string()
    }))
    .query(async ({ ctx, input: { courseSlug } }) => {
      const certificate = await ctx.prisma.certificate.findFirst({
        where: {
          course: {
            slug: courseSlug,
          },
          userId: ctx.session.user.id,
        },
        include: {
          user: true,
          course: true,
        }
      })

      return {
        certificate,
      };
    }),
  getAllCertificates: protectedProcedure
    .query(async ({ ctx }) => {
      const certificates = await ctx.prisma.certificate.findMany({
        include: {
          user: true,
        }
      })

      return {
        certificates,
      };
    }),
});

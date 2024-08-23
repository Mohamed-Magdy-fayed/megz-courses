import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
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
          user: { connect: { id: studentId } },
        }
      })

      return {
        certificate,
      };
    }),
  getCertificate: protectedProcedure
    .input(z.object({
      courseSlug: z.string(),
      levelSlug: z.string(),
    }))
    .query(async ({ ctx, input: { courseSlug, levelSlug } }) => {
      const certificate = await ctx.prisma.certificate.findFirst({
        where: {
          course: { slug: courseSlug },
          courseLevel: { slug: levelSlug },
          userId: ctx.session.user.id,
        },
        include: {
          user: { include: { zoomGroups: { include: { trainer: { include: { user: true } } } } } },
          course: true,
        }
      })

      return {
        certificate,
      };
    }),
  getCertificateById: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input: { id } }) => {
      const certificate = await ctx.prisma.certificate.findFirst({
        where: {
          certificateId: id,
        },
        include: {
          user: { include: { zoomGroups: { include: { trainer: { include: { user: true } } } } } },
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

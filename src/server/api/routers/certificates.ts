import { env } from "@/env.mjs";
import { generateCertificateId } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const certificatesRouter = createTRPCRouter({
  createCertificate: protectedProcedure
    .input(z.object({
      courseSlug: z.string(),
      levelSlug: z.string(),
      score: z.string(),
    }))
    .mutation(async ({ ctx, input: { courseSlug, levelSlug, score } }) => {
      const certificate = await ctx.prisma.certificate.create({
        data: {
          certificateId: generateCertificateId(),
          completionDate: new Date(),
          user: { connect: { id: ctx.session.user.id } },
          course: { connect: { slug: courseSlug } },
          courseLevel: { connect: { slug: levelSlug } },
        },
        include: { user: true, course: true }
      })

      await ctx.prisma.userNote.create({
        data: {
          sla: 0,
          status: "Closed",
          title: `Student final test submitted with score ${score}`,
          type: "Info",
          messages: [{
            message: `Final test submitted and user certificate was created ${certificate.certificateId}\nCertificate URL: ${env.NEXTAUTH_URL}certificates/${certificate.certificateId}`,
            updatedAt: new Date(),
            updatedBy: "System"
          }],
          createdByUser: { connect: { id: ctx.session.user.id } },
          createdForStudent: { connect: { id: ctx.session.user.id } }
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

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { formatPrice, orderCodeGenerator, salesOperationCodeGenerator } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { env } from "@/env.mjs";
import { createPaymentIntent } from "@/lib/paymobHelpers";

export const selfServeRouter = createTRPCRouter({
    enrollCourse: protectedProcedure
        .input(z.object({
            customerName: z.string(),
            email: z.string(),
            courseId: z.string(),
            phone: z.string().optional(),
            isPrivate: z.boolean().optional(),
        }))
        .mutation(async ({ input: { courseId, email, phone, customerName, isPrivate }, ctx }) => {
            let user = await ctx.prisma.user.findUnique({
                where: {
                    email
                },
                include: { courseStatus: true }
            })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to get user" })
            if (!!phone) {
                user = await ctx.prisma.user.update({
                    where: {
                        email
                    },
                    data: {
                        phone,
                    },
                    include: { courseStatus: true }
                })
            }
            if (!user.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "Phone!!" })

            const foundMatchingCourse = user?.courseStatus.some((status) => status.courseId === courseId)

            if (foundMatchingCourse) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'This course is already in progress or completed by the user.',
                });
            }

            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseId
                }
            })

            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "course not found" })

            const orderNumber = orderCodeGenerator()
            const price = isPrivate ? course.privatePrice : course.groupPrice

            const intentResponse = await createPaymentIntent(price, course, user, orderNumber)
            if (!intentResponse.client_secret) throw new TRPCError({ code: "BAD_REQUEST", message: "an error occured please try again!" })

            const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

            const salesOperation = await ctx.prisma.salesOperation.create({
                data: {
                    code: salesOperationCodeGenerator(),
                    status: "created",
                },
            })

            const order = await ctx.prisma.order.create({
                data: {
                    amount: price,
                    orderNumber,
                    paymentId: intentResponse.id,
                    course: { connect: { id: course.id } },
                    salesOperation: { connect: { id: salesOperation.id } },
                    user: { connect: { email } },
                    courseType: {
                        id: course.id,
                        isPrivate: isPrivate ? isPrivate : false,
                    }
                },
                include: {
                    course: true,
                    user: true,
                    salesOperation: { include: { assignee: { include: { user: true } } } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "orderCreated",
                    course: { connect: { id: courseId } },
                    user: { connect: { id: user.id } },
                }
            })

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `An Order Placed by the user ${user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: user.id } },
                    messages: [{
                        message: `An order was placed by for the student by the system regarding course ${course?.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: user.id } },
                }
            })

            const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary



            return {
                salesOperation,
                course,
                order,
                paymentLink,
                emailProps: {
                    logoUrl: logoUrl || "",
                    orderCreatedAt: format(order.createdAt, "dd MMM yyyy"),
                    userEmail: email,
                    orderAmount: formatPrice(order.amount),
                    orderNumber: order.orderNumber,
                    paymentLink: paymentLink,
                    customerName: customerName,
                    course: { courseName: course.name, coursePrice: formatPrice(price) },
                }
            }
        }),
});

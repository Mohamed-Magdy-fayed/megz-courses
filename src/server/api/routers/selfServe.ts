import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { formatPrice, orderCodeGenerator, leadsCodeGenerator } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { env } from "@/env.mjs";
import { createPaymentIntent } from "@/lib/paymobHelpers";
import { EmailsWrapper } from "@/components/emails/EmailsWrapper";
import Email from "@/components/emails/Email";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { subscriptionTiers } from "@/lib/system";

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
                    message: 'This course is already in progress or Completed by the user.',
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

            const lead = await ctx.prisma.lead.create({
                data: {
                    code: leadsCodeGenerator(),
                    isAssigned: false,
                    isAutomated: true,
                    isReminderSet: true,
                    source: "Other",
                    email,
                    phone,
                    name: customerName,
                    leadStage: { connect: { name: "Converted" } },
                    labels: { connectOrCreate: { where: { value: "Enrolled from site" }, create: { value: "Enrolled from site" } } },
                    reminders: { set: [{ title: "Create placement test", time: new Date(new Date().getTime() + 60 * 60 * 1000) }] },

                },
            })

            const order = await ctx.prisma.order.create({
                data: {
                    amount: price,
                    orderNumber,
                    paymentId: intentResponse.id,
                    course: { connect: { id: course.id } },
                    lead: { connect: { id: lead.id } },
                    user: { connect: { email } },
                    courseType: {
                        id: course.id,
                        isPrivate: isPrivate ? isPrivate : false,
                    },
                    paymentLink,
                },
                include: {
                    course: true,
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "OrderCreated",
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
                        message: `An order was placed by for the Student by the system regarding course ${course?.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: user.id } },
                }
            })

            const html = await EmailsWrapper({
                EmailComp: Email,
                prisma: ctx.prisma,
                props: {
                    orderCreatedAt: format(order.createdAt, "dd MMM yyyy"),
                    userEmail: email,
                    orderAmount: formatPrice(order.amount),
                    orderNumber: order.orderNumber,
                    paymentLink: paymentLink,
                    customerName: customerName,
                    course: { courseName: course.name, coursePrice: formatPrice(price) },
                }
            })

            const tier = env.TIER
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({
                email,
                html,
                subject: `Thanks for your order ${order.orderNumber}`
            })

            return {
                lead,
                course,
                order,
                paymentLink,
            }
        }),
});

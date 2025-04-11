import { EmailsWrapper } from "@/components/general/emails/EmailsWrapper";
import OrderCreatedEmail from "@/components/general/emails/OrderCreatedEmail";
import { env } from "@/env.mjs";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { createPaymentIntent } from "@/lib/paymobHelpers";
import { subscriptionTiers } from "@/lib/system";
import { orderCodeGenerator, leadsCodeGenerator, formatPrice } from "@/lib/utils";
import { createInnerTRPCContext } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { format } from "date-fns";
import { z } from "zod";
import { sendNewUserCredintialsAndConfirm } from "@/server/actions/emails";

export const enrollmentInput = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    withPayment: z.boolean(),
    isPrivate: z.boolean().optional(),
    courseId: z.string().optional(),
    productId: z.string().optional(),
}).refine(data => data.courseId || data.productId, {
    message: "Either courseId or productId must be provided.",
})

export const enrollHandler = async ({
    input: { email, phone, name, isPrivate, courseId, productId, withPayment },
    ctx,
}: {
    input: z.infer<typeof enrollmentInput>;
    ctx: ReturnType<typeof createInnerTRPCContext>;
}) => {
    let user = await ctx.prisma.user.findUnique({ where: { email } });
    if (!user) {
        try {
            const password = "@P" + randomUUID().toString().split("-")[0] as string;
            const hashedPassword = await bcrypt.hash(password, 10)
            user = await ctx.prisma.user.create({ data: { name, email, phone, hashedPassword } });

            await sendNewUserCredintialsAndConfirm({
                prisma: ctx.prisma,
                userId: user.id,
                email: user.email,
                phone,
                customerName: user.name,
                password,
            })
        } catch {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "The phone number is already associated with an existing user.",
            });
        }
    }

    // Determine source and gather course info
    let selectedCourses: { id: string; name: string; levelId?: string; }[] = [];
    let productName = "";
    let productDescription = "";
    let totalAmount = 0;

    if (courseId) {
        const course = await ctx.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found" });

        selectedCourses = [{ id: course.id, name: course.name }];
        productName = course.name;
        productDescription = course.description ?? "";
        totalAmount = isPrivate ? course.privatePrice : course.groupPrice;
    } else if (productId) {
        const product = await ctx.prisma.product.findUnique({
            where: { id: productId },
            include: {
                productItems: { include: { course: true, level: true } },
            },
        });
        if (!product) throw new TRPCError({ code: "BAD_REQUEST", message: "Product not found" });

        selectedCourses = product.productItems.map(({ course, level }) => ({
            id: course.id,
            name: course.name,
            levelId: level?.id,
        }));

        productName = product.name;
        productDescription = product.description ?? "";
        totalAmount = product.discountedPrice ?? product.price;
    }

    const orderNumber = orderCodeGenerator();
    let paymentLink = "";

    if (withPayment) {
        const tier = env.TIER;
        const hasOnlinePayment = subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment;
        if (hasOnlinePayment) {
            const intentResponse = await createPaymentIntent(totalAmount, { name: productName, description: productDescription }, user, orderNumber);
            if (!intentResponse.client_secret) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Payment failed. Please try again." });
            }
            paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`;
        }
    }

    const [lead] = await ctx.prisma.$transaction([
        ctx.prisma.lead.create({
            data: {
                code: leadsCodeGenerator(),
                isAssigned: false,
                isAutomated: true,
                isReminderSet: true,
                source: "Other",
                email,
                phone,
                name,
                leadStage: { connect: { name: "Converted" } },
                labels: {
                    connectOrCreate: {
                        where: { value: "Enrolled from site" },
                        create: { value: "Enrolled from site" },
                    },
                },
                reminders: {
                    set: [{ title: "Process Order", time: new Date(Date.now() + 60 * 60 * 1000) }],
                },
                orders: {
                    create: {
                        amount: totalAmount,
                        orderNumber,
                        courseType: courseId ? {
                            id: courseId,
                            isPrivate: isPrivate || false,
                        } : undefined,
                        course: courseId ? { connect: { id: courseId } } : undefined,
                        product: productId ? { connect: { id: productId } } : undefined,
                        user: { connect: { email } },
                        paymentLink,
                        courseStatuses: {
                            create: selectedCourses.map(course => ({
                                status: "OrderCreated",
                                course: { connect: { id: course.id } },
                                user: { connect: { id: user.id } },
                                level: course.levelId ? { connect: { id: course.levelId } } : undefined,
                            })),
                        },
                    },
                },
            },
        }),
        ctx.prisma.userNote.create({
            data: {
                sla: 0,
                status: "Closed",
                title: `An Order Placed by ${user.name}`,
                type: "Info",
                createdForStudent: { connect: { id: user.id } },
                messages: [{
                    message: `An order was placed for ${selectedCourses.length > 1 ? "multiple courses" : selectedCourses[0]?.name}. ${withPayment ? `Payment link: ${paymentLink}` : ""}`,
                    updatedAt: new Date(),
                    updatedBy: "System",
                }],
                createdByUser: { connect: { id: user.id } },
            },
        }),
    ]);

    const html = await EmailsWrapper({
        EmailComp: OrderCreatedEmail,
        prisma: ctx.prisma,
        props: {
            isPaymentEnabled: withPayment,
            orderCreatedAt: format(lead.createdAt, "dd MMM yyyy"),
            userEmail: email,
            orderAmount: formatPrice(totalAmount),
            orderNumber,
            paymentLink,
            customerName: name,
            product: { productName, productPrice: formatPrice(totalAmount) },
        },
    });

    await sendZohoEmail({
        email,
        html,
        subject: `Thanks for your order ${orderNumber}`,
    });

    return { orderNumber, paymentLink };
};

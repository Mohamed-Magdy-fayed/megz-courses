import { CredentialsEmail } from "@/components/general/emails/CredintialsEmail";
import EmailConfirmation from "@/components/general/emails/EmailConfirmation";
import { EmailsWrapper } from "@/components/general/emails/EmailsWrapper";
import OrderCreatedEmail from "@/components/general/emails/OrderCreatedEmail";
import PaymentEmail from "@/components/general/emails/PaymentEmail";
import RefundEmail from "@/components/general/emails/RefundEmail";
import { env } from "@/env.mjs";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { formatPrice } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { prisma } from "@/server/db";
import { PrismaClient, User } from "@prisma/client";
import { format } from "date-fns";
import bcrypt from "bcrypt";
import PlacementTestEmail from "@/components/general/emails/PlacementTestEmail";
import PlacementResultEmail from "@/components/general/emails/PlacementResultEmail";
import AddedToGroupEmail from "@/components/general/emails/AddedToGroupEmail";
import UpcomingSessionReminderEmail from "@/components/general/emails/UpcomingSessionReminderEmail";
import SessionStartedEmail from "@/components/general/emails/SessionStartedEmail";
import SessionEndedEmail from "@/components/general/emails/SessionEndedEmail";
import FinalTestInvitationEmail from "@/components/general/emails/FinalTestInvitationEmail";
import CourseCompletionCongratulationsEmail from "@/components/general/emails/CourseCompletionCongratulationsEmail";
import { sendNotification } from "@/lib/fcmhelpers";
import { send } from "process";

type CommsUserData = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    studentFcmTokens: string[];
}

export const formatUserForComms = (user: User): CommsUserData => {
    return { studentEmail: user.email, studentName: user.name, studentPhone: user.phone, studentFcmTokens: user.fcmTokens, studentId: user.id }
}

export async function orderConfirmationEmail({ prisma, product, student, order }: {
    prisma: PrismaClient;
    product: { name: string; price: number; };
    order: { paymentLink: string; orderNumber: string; orderDate: Date; };
    student: CommsUserData;
}) {
    const { name, price } = product
    const { studentPhone, studentEmail, studentName, studentFcmTokens } = student
    const { orderNumber, orderDate, paymentLink } = order
    const formattedPrice = formatPrice(price)

    const html = await EmailsWrapper({
        EmailComp: OrderCreatedEmail,
        prisma,
        props: {
            product: { productName: name, productPrice: formattedPrice },
            customerName: studentName,
            userEmail: studentEmail,
            orderNumber,
            orderAmount: formattedPrice,
            orderCreatedAt: format(orderDate, "PPPp"),
            paymentLink,
            isPaymentEnabled: true,
        }
    })

    await sendNotification({ tokens: studentFcmTokens, title: "Order Confirmation", body: `Your order ${orderNumber} has been placed successfully.\nClick on the notification to get redirected to online payment!`, link: paymentLink })
    await sendZohoEmail({ email: studentEmail, html, subject: `Thanks for your order ${orderNumber}` })
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "OrderPlaced",
        variables: {
            name: studentName,
            orderNumber,
            orderTotal: formattedPrice,
            paymentLink
        },
    })
}

export async function orderPaymentEmail({ payment, student, order, remainingAmount }: {
    payment: { paymentAmount: number; createdAt: Date; };
    order: { orderNumber: string; amount: number; createdAt: Date; };
    student: CommsUserData;
    remainingAmount: number;
}) {
    const { paymentAmount, createdAt: paymentCreatedAt } = payment
    const { studentPhone, studentEmail, studentName, studentFcmTokens } = student
    const { orderNumber, createdAt, amount } = order

    const html = await EmailsWrapper({
        EmailComp: PaymentEmail,
        prisma,
        props: {
            email: studentEmail,
            name: studentName,
            orderNumber,
            orderDate: format(createdAt, "PPPp"),
            orderTotal: formatPrice(amount),
            paidAmount: formatPrice(paymentAmount),
            paymentDate: format(paymentCreatedAt, "PPPp"),
            remainingAmount,
        }
    })

    await sendNotification({ tokens: studentFcmTokens, title: "Payment Confirmation", body: `Your payment of ${formatPrice(paymentAmount)} for order ${orderNumber} has been received successfully!`, link: `${env.NEXTAUTH_URL}student/my_courses` })
    await sendZohoEmail({ email: studentEmail, html, subject: `Thanks for your order ${orderNumber}` })
    const { success, error } = await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "OrderPaid",
        variables: {
            name: studentName,
            orderNumber,
            paymentAmount: formatPrice(paymentAmount),
            coursesLink: `${env.NEXTAUTH_URL}student/my_courses`
        },
    })
    return { success, error }
}

export async function orderRefundEmail({ refund, student, order }: {
    refund: { refundAmount: number; createdAt: Date; };
    order: { orderNumber: string; amount: number; createdAt: Date; };
    student: CommsUserData;
}) {
    const { refundAmount } = refund
    const { studentEmail, studentName, studentPhone, studentFcmTokens } = student
    const { orderNumber } = order

    const html = await EmailsWrapper({
        EmailComp: RefundEmail,
        prisma,
        props: {
            refundAmount: formatPrice(refundAmount),
            orderNumber,
            name: studentName,
        }
    })

    await sendNotification({ tokens: studentFcmTokens, title: "Refund Confirmation", body: `Your refund of ${formatPrice(refundAmount)} for order ${orderNumber} has been processed successfully!`, link: `${env.NEXTAUTH_URL}student/my_courses` })
    await sendZohoEmail({ email: studentEmail, html, subject: `Thanks for your order ${orderNumber}` })
    const { success, error } = await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "OrderRefunded",
        variables: {
            name: studentName,
            orderNumber,
            refundAmount: formatPrice(refundAmount),
        },
    })
    return { success, error }
}

export async function sendNewUserCredintialsAndConfirm({ studentName, studentEmail, studentPhone, studentFcmTokens, password, prisma, studentId }: CommsUserData & {
    prisma: PrismaClient;
    password: string;
}) {
    try {
        const html = await EmailsWrapper({
            EmailComp: CredentialsEmail,
            prisma,
            props: {
                userEmail: studentEmail,
                customerName: studentName,
                password,
                courseLink: `${env.NEXTAUTH_URL}student/my_courses`,
            },
        });

        await sendZohoEmail({
            email: studentEmail,
            html,
            subject: `Your credentials for accessing the course materials`,
        });

        const accessToken = await bcrypt.hash(studentId, 10);

        const htmlConfirm = await EmailsWrapper({
            EmailComp: EmailConfirmation,
            prisma,
            props: {
                customerName: studentName,
                userEmail: studentEmail,
                confirmationLink: `${env.NEXTAUTH_URL}email_conf/${studentId}?access_token=${accessToken}`,
            },
        });

        await sendZohoEmail({
            email: studentEmail,
            html: htmlConfirm,
            subject: `Confirm your email, ${studentName}`,
        });

        await sendWhatsAppMessage({
            toNumber: studentPhone, prisma, type: "CredentialsEmail", variables: {
                email: studentEmail,
                name: studentName,
                password,
                coursesLink: `${env.NEXTAUTH_URL}student/my_courses`,
            }
        })
    } catch (error) {
        console.log(error);
        throw new Error(JSON.stringify(error))
    }
}

export async function placementTestScheduledComms({ courseSlug, studentName, studentFcmTokens, studentEmail, studentPhone, testTime, testerName }: CommsUserData & {
    courseSlug: string;
    testTime: Date;
    testerName: string;
}) {
    const html = await EmailsWrapper({
        EmailComp: PlacementTestEmail,
        prisma,
        props: {
            studentName,
            testDate: format(testTime, "PPP"),
            testTime: format(testTime, "pp"),
            testerName,
            courseSlug,
        }
    })

    await sendNotification({ tokens: studentFcmTokens, title: "Placement Test Scheduled", body: `Your placement test has been scheduled for ${format(testTime, "PPPpp")}.`, link: `${env.NEXTAUTH_URL}student/placement_test/${courseSlug}` })
    await sendZohoEmail({ email: studentEmail, html, subject: `Your Placement Test Has Been Scheduled` })
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "PlacementTestScheduled",
        variables: {
            meetingLink: `${env.NEXTAUTH_URL}student/placement_test/${courseSlug}`,
            name: studentName,
            testTime: format(testTime, "PPPpp"),
            trainerName: testerName,
        },
    })
}

export async function placementResultComms({ courseSlug, studentName, courseName, levelName, studentEmail, studentPhone, studentFcmTokens }: CommsUserData & {
    courseName: string;
    courseSlug: string;
    levelName: string;
}) {
    const html = await EmailsWrapper({
        EmailComp: PlacementResultEmail,
        prisma,
        props: {
            studentName,
            courseName,
            levelName,
            courseSlug,
        }
    })

    await sendNotification({ tokens: studentFcmTokens, title: "Placement Test Result", body: `Your placement test result is ready.`, link: `${env.NEXTAUTH_URL}student/placement_test/${courseSlug}` })
    await sendZohoEmail({ email: studentEmail, html, subject: `Your Placement Result is Ready` })
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "PlacementTestResult",
        variables: {
            courseLink: `${env.NEXTAUTH_URL}student/my_courses/${courseSlug}`,
            courseName,
            levelName,
            studentName,
        },
    })
}

export async function sendGroupCreatedComms({ studentName, trainerName, studentFcmTokens, groupStartDate, courseName, courseSlug, studentEmail, studentPhone }: CommsUserData & {
    trainerName: string;
    groupStartDate: Date;
    courseName: string;
    courseSlug: string;
}) {
    const formattedDate = format(groupStartDate, "PPPpp")
    const html = await EmailsWrapper({
        EmailComp: AddedToGroupEmail,
        prisma,
        props: {
            studentName,
            trainerName,
            groupStartDate: formattedDate,
            courseName,
            courseSlug,
        }
    })

    await sendNotification({ tokens: studentFcmTokens, title: "Group Created", body: `You have been added to a group for ${courseName} starting on ${formattedDate}.`, link: `${env.NEXTAUTH_URL}student/my_courses/${courseSlug}` })
    await sendZohoEmail({ email: studentEmail, html, subject: `You're enrolled in a group for ${courseName}` })
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "AddedToGroup",
        variables: {
            groupStartDate: formattedDate,
            name: studentName,
            trainerName,
        },
    })
}

export async function sendSessionStartingSoonComms({ studentName, studentEmail, studentFcmTokens, studentPhone, sessionDate, courseName, quizLink, zoomJoinLink }: CommsUserData & {
    sessionDate: Date;
    courseName: string;
    quizLink: string;
    zoomJoinLink: string;
}) {
    const sessionTime = format(sessionDate, "PPPpp");

    const html = await EmailsWrapper({
        EmailComp: UpcomingSessionReminderEmail,
        prisma,
        props: {
            studentName,
            courseName,
            quizLink,
            sessionDate: sessionTime,
            zoomJoinLink,
        }
    });

    await sendNotification({ tokens: studentFcmTokens, title: "Session Starting Soon", body: `Your session for ${courseName} is starting soon!`, link: quizLink })
    await sendZohoEmail({ email: studentEmail, html, subject: `Your upcoming session for${courseName} is starting soon!` });
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "SessionStartingSoon",
        variables: {
            courseName,
            name: studentName,
            quizLink,
            sessionTime,
        },
    });
}

export async function sendSessionStartComms({ studentName, studentFcmTokens, sessionTitle, courseName, zoomJoinLink, materialLink, materialSlug, studentEmail, studentPhone, uploads }: CommsUserData & {
    courseName: string;
    sessionTitle: string;
    zoomJoinLink: string;
    materialLink: string;
    materialSlug: string;
    uploads: string[];
}) {
    const html = await EmailsWrapper({
        EmailComp: SessionStartedEmail,
        prisma,
        props: {
            studentName,
            courseName,
            sessionTitle,
            zoomJoinLink,
            materialLink,
        }
    });

    await sendNotification({ tokens: studentFcmTokens, title: "Session Started", body: `Your session for ${courseName} has started!`, link: zoomJoinLink })
    await sendZohoEmail({ email: studentEmail, html, subject: `Your session for ${courseName} has started – join now!` });
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "SessionStarted",
        variables: {
            courseName,
            name: studentName,
            sessionLink: zoomJoinLink,
        },
    });

    await Promise.all(uploads.map(async link => {
        const filename = link.split(`${materialSlug}%2F`)[1]?.split("?alt=")[0] || "File Name"
        await sendWhatsAppMessage({
            prisma,
            toNumber: studentPhone,
            type: "SessionMaterials",
            variables: {
                filename,
                link,
            },
        });
    }))
}

export async function sendSessionEndComms({ studentName, studentFcmTokens, nextSessionDate, assignmentLink, studentEmail, studentPhone, courseName, sessionTitle }: CommsUserData & {
    nextSessionDate: Date;
    assignmentLink: string;
    courseName: string;
    sessionTitle: string;
}) {
    const formattedNextSessionDate = format(nextSessionDate, "PPPpp");

    const html = await EmailsWrapper({
        EmailComp: SessionEndedEmail,
        prisma,
        props: {
            studentName,
            courseName,
            sessionTitle,
            nextSessionDate: formattedNextSessionDate,
            assignmentLink,
        }
    });

    await sendNotification({ tokens: studentFcmTokens, title: "Session Ended", body: `Your session for ${courseName} has ended!`, link: assignmentLink })
    await sendZohoEmail({ email: studentEmail, html, subject: `${courseName} – Your session has ended. Here's what's next.` });
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "SessionCompleted",
        variables: {
            assignmentLink,
            courseName,
            name: studentName,
        },
    });
}

export async function sendGroupEndComms({ studentName, finalTestLink, studentFcmTokens, studentEmail, studentPhone, courseName }: CommsUserData & {
    finalTestLink: string;
    courseName: string;
}) {
    const html = await EmailsWrapper({
        EmailComp: FinalTestInvitationEmail,
        prisma,
        props: {
            studentName,
            courseName,
            finalTestLink,
        }
    });

    await sendNotification({ tokens: studentFcmTokens, title: "Group Completed", body: `Your group for ${courseName} has completed!`, link: finalTestLink })
    await sendZohoEmail({ email: studentEmail, html, subject: `Your ${courseName} Zoom sessions are done — it's time for your final test!` });
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "GroupCompleted",
        variables: {
            courseName,
            finalTestLink,
            studentName,
        },
    });
}

export async function sendCertificateComms({ studentName,studentFcmTokens, certificateLink, studentEmail, studentPhone, courseName }: CommsUserData & {
    certificateLink: string;
    courseName: string;
}) {
    const html = await EmailsWrapper({
        EmailComp: CourseCompletionCongratulationsEmail,
        prisma,
        props: {
            studentName,
            courseName,
            certificateLink,
        }
    });

    await sendNotification({ tokens: studentFcmTokens, title: "Certificate Ready", body: `Your certificate for ${courseName} is ready!`, link: certificateLink })
    await sendZohoEmail({ email: studentEmail, html, subject: `Your certificate is now ready — Congratulations!` });
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "CertificateReady",
        variables: {
            studentName,
            courseName,
            certificateLink,
        },
    });
}

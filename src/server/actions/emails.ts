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
import { PrismaClient } from "@prisma/client";
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

export async function orderConfirmationEmail({ prisma, product, student, order }: {
    prisma: PrismaClient;
    product: { name: string; price: number; };
    order: { paymentLink: string; orderNumber: string; orderDate: Date; };
    student: { studentName: string; studentEmail: string; studentPhone: string; };
}) {
    const { name, price } = product
    const { studentPhone, studentEmail, studentName } = student
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
    student: { name: string; email: string; phone: string; };
    remainingAmount: number;
}) {
    const { paymentAmount, createdAt: paymentCreatedAt } = payment
    const { email, name, phone } = student
    const { orderNumber, createdAt, amount } = order

    const html = await EmailsWrapper({
        EmailComp: PaymentEmail,
        prisma,
        props: {
            email,
            name,
            orderNumber,
            orderDate: format(createdAt, "PPPp"),
            orderTotal: formatPrice(amount),
            paidAmount: formatPrice(paymentAmount),
            paymentDate: format(paymentCreatedAt, "PPPp"),
            remainingAmount,
        }
    })

    await sendZohoEmail({ email, html, subject: `Thanks for your order ${orderNumber}` })
    const { success, error } = await sendWhatsAppMessage({
        prisma,
        toNumber: phone,
        type: "OrderPaid",
        variables: {
            name,
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
    student: { name: string; email: string; phone: string; };
}) {
    const { refundAmount } = refund
    const { email, name, phone } = student
    const { orderNumber } = order

    const html = await EmailsWrapper({
        EmailComp: RefundEmail,
        prisma,
        props: {
            refundAmount: formatPrice(refundAmount),
            orderNumber,
            name,
        }
    })

    await sendZohoEmail({ email, html, subject: `Thanks for your order ${orderNumber}` })
    const { success, error } = await sendWhatsAppMessage({
        prisma,
        toNumber: phone,
        type: "OrderRefunded",
        variables: {
            name,
            orderNumber,
            refundAmount: formatPrice(refundAmount),
        },
    })
    return { success, error }
}

export async function sendNewUserCredintialsAndConfirm({ customerName, email, phone, password, prisma, userId }: {
    prisma: PrismaClient;
    userId: string;
    phone: string;
    email: string;
    customerName: string;
    password: string;
}) {
    try {
        const html = await EmailsWrapper({
            EmailComp: CredentialsEmail,
            prisma,
            props: {
                userEmail: email,
                customerName,
                password,
                courseLink: `${env.NEXTAUTH_URL}student/my_courses`,
            },
        });

        await sendZohoEmail({
            email,
            html,
            subject: `Your credentials for accessing the course materials`,
        });

        const accessToken = await bcrypt.hash(userId, 10);

        const htmlConfirm = await EmailsWrapper({
            EmailComp: EmailConfirmation,
            prisma,
            props: {
                customerName,
                userEmail: email,
                confirmationLink: `${env.NEXTAUTH_URL}email_conf/${userId}?access_token=${accessToken}`,
            },
        });

        await sendZohoEmail({
            email,
            html: htmlConfirm,
            subject: `Confirm your email, ${customerName}`,
        });

        await sendWhatsAppMessage({
            toNumber: phone, prisma, type: "CredentialsEmail", variables: {
                email,
                name: customerName,
                password,
                coursesLink: `${env.NEXTAUTH_URL}student/my_courses`,
            }
        })

        await sendWhatsAppMessage({
            toNumber: phone, prisma, type: "ConfirmEmail", variables: {
                name: customerName,
                confirmationLink: `${env.NEXTAUTH_URL}email_conf/${userId}?access_token=${accessToken}`,
            }
        })
    } catch (error) {
        console.log(error);
        throw new Error(JSON.stringify(error))
    }
}

export async function placementTestScheduledComms({ courseSlug, studentName, studentEmail, studentPhone, testTime, testerName }: {
    courseSlug: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
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

export async function placementResultComms({ courseSlug, studentName, courseName, levelName, studentEmail, studentPhone }: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
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

export async function sendGroupCreatedComms({ studentName, trainerName, groupStartDate, courseName, courseSlug, studentEmail, studentPhone }: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
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

export async function sendSessionStartingSoonComms({ studentName, studentEmail, studentPhone, sessionDate, courseName, quizLink, zoomJoinLink }: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
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

export async function sendSessionStartComms({ studentName, sessionTitle, courseName, zoomJoinLink, materialLink, materialSlug, studentEmail, studentPhone, uploads }: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
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

export async function sendSessionEndComms({ studentName, nextSessionDate, assignmentLink, studentEmail, studentPhone, courseName, sessionTitle }: {
    studentName: string;
    nextSessionDate: Date;
    assignmentLink: string;
    studentEmail: string;
    studentPhone: string;
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

export async function sendGroupEndComms({ studentName, finalTestLink, studentEmail, studentPhone, courseName }: {
    studentName: string;
    finalTestLink: string;
    studentEmail: string;
    studentPhone: string;
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

export async function sendCertificateComms({ studentName, certificateLink, studentEmail, studentPhone, courseName }: {
    studentName: string;
    certificateLink: string;
    studentEmail: string;
    studentPhone: string;
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

    await sendZohoEmail({ email: studentEmail, html, subject: `Your ${courseName} Zoom sessions are done — it's time for your final test!` });
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

import { env } from "@/env.mjs";
import { MessageTemplate, MessageTemplateType, PrismaClient, MessageTemplateButton } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";

type SendTemplateInput<T extends MessageTemplateType> = {
    toNumber: string;
    prisma: PrismaClient;
    type: T,
    variables: MessageTemplateMapping[T]
};

export async function sendWhatsAppMessage<T extends MessageTemplateType>({ toNumber, prisma, type, variables }: SendTemplateInput<T>) {
    const template = await prisma.messageTemplate.findFirst({ where: { type } })
    if (!template) return { success: false, error: "Template Not found!" };
    const metaClient = await prisma.metaClient.findFirst()
    if (!metaClient) return { success: false, error: "Whatsapp not configured!" };

    const messageBody = populateMessageBody({ type, body: template?.body, variables })

    let data: string;

    if (template.button) {
        data = JSON.stringify({
            messaging_product: "whatsapp",
            to: toNumber,
            type: "interactive",
            interactive: {
                type: "cta_url",
                body: { text: messageBody },
                action: {
                    name: "cta_url",
                    parameters: {
                        display_text: template.button.text,
                        url: variables[template.button.url as keyof typeof variables]
                    }
                },
            },
        });
    } else if (template.document) {
        data = JSON.stringify({
            messaging_product: "whatsapp",
            to: toNumber,
            type: "document",
            document: {
                link: variables[template.document.link as keyof typeof variables],
                caption: populateMessageBody({ body: template.document.caption, type, variables }),
                filename: variables[template.document.filename as keyof typeof variables],
            },
        });
    } else {
        data = JSON.stringify({
            messaging_product: "whatsapp",
            to: toNumber,
            type: "text",
            text: { preview_url: true, body: messageBody },
        });
    }

    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/${env.WHATSAPP_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metaClient.accessToken}`,
        },
        data,
    };

    try {
        const response = await axios.request(config);
        return response.status === 200
            ? { success: true, toNumber, messageBody }
            : { success: false, toNumber, messageBody };
    } catch (error) {
        console.error("WhatsApp API Error", { toNumber, messageBody });
        return { success: false, error };
    }
}

export async function sendWhatsAppCustomMessage({ toNumber, text, prisma }: { toNumber: string, text: string, prisma: PrismaClient }) {
    const metaClient = await prisma.metaClient.findFirst()
    if (!metaClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No WhatsApp configured!" })

    const data = JSON.stringify({
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: {
            preview_url: true,
            body: text,
        },
    });

    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/${env.WHATSAPP_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metaClient.accessToken}`,
        },
        data: data,
    };

    try {
        const response = await axios.request(config);

        if (response.status === 200) {
            return { success: true, toNumber, text };
        } else {
            return { success: false, toNumber, text };
        }
    } catch (error) {
        console.error("WhatsApp API not Active - ", { toNumber, text });
        return { success: false, error };
    }
}

export type TemplateVariables = {
    [key: string]: string | number; // Values to replace in the template
};

export function extractVariables(templateBody: string): string[] {
    const variableRegex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(templateBody)) !== null) {
        variables.push(match[1]!);
    }

    return variables;
}

export function populateTemplate(template: MessageTemplate, values: TemplateVariables): string {
    let populatedBody = template.body;


    for (const [key, value] of Object.entries(values)) {
        populatedBody = populatedBody.replace(`{{${key}}}`, String(value));
    }

    return populatedBody;
}

const messageTemplates = [
    {
        name: 'Welcome',
        type: MessageTemplateType.Welcome,
        body: 'Welcome to Gateling TMS, {{name}}!\n\nWe\'re excited to have you join our community.\nStart exploring our courses and enhancing your skills today!',
        placeholders: ['name'],
    },
    {
        name: 'Confirm Email',
        type: MessageTemplateType.ConfirmEmail,
        body: 'Hi {{name}},\n\nplease confirm your email address by clicking on the following link: {{confirmationLink}}\n\nThis will help us keep your account secure.',
        placeholders: ['name', 'confirmationLink'],
    },
    {
        name: 'Email Confirmed',
        type: MessageTemplateType.EmailConfirmed,
        body: 'Hi {{name}},\n\nYour email address has been successfully confirmed!\nWelcome aboard. You can now log in and start your learning journey with us.',
        placeholders: ['name'],
    },
    {
        name: 'Credentials Email',
        type: MessageTemplateType.CredentialsEmail,
        body: 'Hi {{name}},\n\nThank you for choosing us! Here are your credentials for accessing the course materials.\n\nUsername: {{email}}\nPassword: {{password}}\n\nYou can login and access your courses from this link: {{coursesLink}}',
        placeholders: ['name', 'email', 'password', 'coursesLink'],
    },
    {
        name: 'Order Placed',
        type: MessageTemplateType.OrderPlaced,
        body: 'Hi {{name}},\n\nYour order {{orderNumber}} has been placed successfully. it\'s Pending payment now for {{orderTotal}}\nYou can pay it through this link: {{paymentLink}}',
        placeholders: ['name', 'orderNumber', 'orderTotal', 'paymentLink'],
    },
    {
        name: 'Order Paid',
        type: MessageTemplateType.OrderPaid,
        body: 'Hi {{name}},\n\nWe have received your payment of {{paymentAmount}} for order {{orderNumber}}.\nYour can now access the content through our website here: {{coursesLink}}',
        placeholders: ['name', 'orderNumber', 'coursesLink', 'paymentAmount'],
    },
    {
        name: 'Order Cancelled',
        type: MessageTemplateType.OrderCancelled,
        body: 'Hi {{name}},\n\nwe\'re sorry to inform you that your order with number {{orderNumber}} has been cancelled. If you have any questions, please contact our support team.',
        placeholders: ['name', 'orderNumber'],
    },
    {
        name: 'Order Refunded',
        type: MessageTemplateType.OrderRefunded,
        body: 'Hi {{name}},\n\nyour refund for order ID {{orderNumber}} has been processed successfully. The amount {{refundAmount}} will reflect in your account shortly.',
        placeholders: ['name', 'orderNumber', 'refundAmount'],
    },
    {
        name: 'Placement Test Scheduled',
        type: MessageTemplateType.PlacementTestScheduled,
        body: 'Hi {{name}},\n\nYour placement test has been Scheduled with Mr. {{trainerName}} at {{testTime}}.\nPlease be prepared and reach out if you have any questions!\nMeeting Link: {{meetingLink}}',
        placeholders: ['name', 'trainerName', 'testTime', 'meetingLink'],
    },
    {
        name: 'Placement Test Rescheduled',
        type: MessageTemplateType.PlacementTestRescheduled,
        body: 'Hi {{name}},\n\nYour placement test originally Scheduled for {{originalDate}} has been rescheduled to {{newDate}}. We look forward to seeing you!\nJoin the meeting here: {{meetingLink}}',
        placeholders: ['name', 'originalDate', 'newDate', 'meetingLink'],
    },
    {
        name: 'Placement Test Result',
        type: MessageTemplateType.PlacementTestResult,
        body: 'Hi {{studentName}}, 👋\n\nGreat news! You\'ve been placed into the {{levelName}} level for the course: {{courseName}} 🎉\n\nYou can view your course details and get started here: {{courseLink}}\n\nOnce your course begins—whether in a group or private session—you’ll receive a notification with the schedule.\n\nWe\'re excited to see your progress! 🚀',
        placeholders: ['studentName', 'levelName', 'courseName', 'courseLink'],
    },
    {
        name: 'Added To Waiting List',
        type: MessageTemplateType.AddedToWaitingList,
        body: 'Hi {{name}},\n\nYou\'ve been added to the Waiting list for {{courseName}}.\nWe will notify you once a spot becomes available. Thank you for your patience!',
        placeholders: ['name', 'courseName'],
    },
    {
        name: 'Added To Group',
        type: MessageTemplateType.AddedToGroup,
        body: `Hi {{name}},
We're excited to let you know that you've been successfully added to a new group for your course journey 🎉
Here are your group details:
👨‍🏫 Teacher: {{trainerName}}
📅 Start Date: {{groupStartDate}}

When each session begins, you'll receive an email with:
🔗 A Zoom meeting link to join the session
📥 A download link for Zoom (for both mobile and desktop)

Make sure to check your inbox before each session so you're ready to join on time.
We look forward to seeing you in class and supporting your progress every step of the way!`,
        placeholders: ['name', 'trainerName', 'groupStartDate'],
    },
    {
        name: 'Session Starting Soon',
        type: MessageTemplateType.SessionStartingSoon,
        body: 'Hi {{name}}, 👋\n\nYour upcoming session for *{{courseName}}* is starting at *{{sessionTime}}*. Please make sure you\'re prepared!\n\nComplete the quick quiz before the session using the button below. 🎯\n\nSee you there! 🚀',
        button: {
            text: 'Take Quiz',
            url: 'quizLink',
        },
        placeholders: ['name', 'courseName', 'sessionTime', 'quizLink'],
    },
    {
        name: 'Session Started',
        type: MessageTemplateType.SessionStarted,
        body: 'Hi {{name}}, 👋\n\nYour session for *{{courseName}}* has just started! 🚀\nIf you haven\'t joined yet, click the button below to get started right away! 🎯\n\nThe session materials will be sent below. 📚\n\nEnjoy your learning experience!',
        button: {
            text: 'Join Session',
            url: 'sessionLink',
        },
        placeholders: ['name', 'courseName', 'sessionLink'],
    },
    {
        name: 'Session Materials',
        type: MessageTemplateType.SessionMaterials,
        body: '',
        document: {
            caption: '📄 {{filename}}',
            link: 'link',
            filename: 'filename',
        },
        placeholders: ['filename', 'link'],
    },
    {
        name: 'Session Updated',
        type: MessageTemplateType.SessionUpdated,
        body: 'Hi {{name}}, 👋\n\nWe wanted to let you know that your session for *{{courseName}}* has been updated.\nThe new session time is *{{newTime}}*. Please make sure to join at the updated time! ⏰\n\nSee you there!',
        placeholders: ['name', 'courseName', 'oldTime', 'newTime'],
    },
    {
        name: 'Session Completed',
        type: MessageTemplateType.SessionCompleted,
        body: 'Hi {{name}}, 🎉\n\nCongratulations on completing your session for *{{courseName}}*! 🏆\nWe hope you found it valuable. Please don’t forget to complete your assignment! 📚\nClick below to access it.',
        button: {
            text: 'Access Assignment',
            url: 'assignmentLink',
        },
        placeholders: ['name', 'courseName', 'assignmentLink'],
    },
    {
        name: 'Group Completed',
        type: MessageTemplateType.GroupCompleted,
        body: 'Hi {{studentName}}, 👋\n\nWell done! You’ve completed all your Zoom sessions for the course: {{courseName}} ✅\n\nYour final step is to take the test from the below link 📝\n\nOnce you complete it, your certificate will be automatically generated and sent to you. 🎓\n\nYou’re almost there—best of luck!',
        button: {
            text: 'Final Test',
            url: 'finalTestLink',
        },
        placeholders: ['studentName', 'courseName', 'finalTestLink'],
    },
    {
        name: 'Certificate Ready',
        type: MessageTemplateType.CertificateReady,
        body: 'Hi {{studentName}}, 🎉\n\nCongratulations on completing the course: {{courseName}}! You’ve done an amazing job. 🙌\n\nYour certificate is now available from the below link 🎓\n\nThank you for learning with us. We hope to see you again in future courses! 🚀',
        button: {
            text: 'Viwe my certificate',
            url: 'certificateLink',
        },
        placeholders: ['studentName', 'courseName', 'certificateLink'],
    }
];

export async function setupDefaultMessageTemplates(prisma: PrismaClient) {
    return {
        createdTemplates: await prisma.$transaction(messageTemplates.map(template => prisma.messageTemplate.upsert({
            where: { name: template.name },
            create: {
                name: template.name,
                type: template.type,
                body: template.body,
                button: template.button,
                document: template.document,
                placeholders: template.placeholders,
            },
            update: {
                name: template.name,
                type: template.type,
                body: template.body,
                button: template.button,
                document: template.document,
                placeholders: template.placeholders,
            },
        })))
    }
}

// Define the type for each template's variables
export type MessageTemplatePlaceholders = {
    [MessageTemplateType.Custom]: { [key: string]: string };
    [MessageTemplateType.Welcome]: { name: string };
    [MessageTemplateType.ConfirmEmail]: { name: string; confirmationLink: string };
    [MessageTemplateType.CredentialsEmail]: { name: string; email: string; password: string; coursesLink: string; };
    [MessageTemplateType.EmailConfirmed]: { name: string };
    [MessageTemplateType.OrderPlaced]: { name: string; orderNumber: string; orderTotal: string; paymentLink: string; };
    [MessageTemplateType.OrderPaid]: { name: string; orderNumber: string; coursesLink: string; paymentAmount: string; };
    [MessageTemplateType.OrderCancelled]: { name: string; orderNumber: string };
    [MessageTemplateType.OrderRefunded]: { name: string; orderNumber: string; refundAmount: string; };
    [MessageTemplateType.PlacementTestScheduled]: { name: string; testTime: string; trainerName: string; meetingLink: string; };
    [MessageTemplateType.PlacementTestRescheduled]: { name: string; originalDate: string; newDate: string; meetingLink: string };
    [MessageTemplateType.PlacementTestResult]: { studentName: string; levelName: string; courseName: string; courseLink: string; };
    [MessageTemplateType.AddedToWaitingList]: { name: string; courseName: string };
    [MessageTemplateType.AddedToGroup]: { name: string, trainerName: string, groupStartDate: string };
    [MessageTemplateType.SessionStartingSoon]: { name: string; courseName: string; sessionTime: string; quizLink: string; };
    [MessageTemplateType.SessionStarted]: { name: string; courseName: string; sessionLink: string; };
    [MessageTemplateType.SessionMaterials]: { filename: string; link: string; };
    [MessageTemplateType.SessionUpdated]: { name: string; courseName: string; newTime: string; oldTime: string; };
    [MessageTemplateType.SessionCompleted]: { name: string; courseName: string; assignmentLink: string; };
    [MessageTemplateType.GroupCompleted]: { studentName: string; courseName: string; finalTestLink: string };
    [MessageTemplateType.CertificateReady]: { studentName: string; courseName: string; certificateLink: string; };
};

// Create a mapping type to ensure type safety
type MessageTemplateMapping = {
    [K in MessageTemplateType]: MessageTemplatePlaceholders[K];
};

// The populateMessageBody function
export function populateMessageBody<T extends MessageTemplateType>({ body, variables }: {
    type: T,
    body: string,
    variables: MessageTemplateMapping[T]
}): string {
    for (const [key, value] of Object.entries(variables)) {
        body = body.replace(`{{${key}}}`, value);
    }
    return body;
}

import { env } from "@/env.mjs";
import { MessageTemplate, MessageTemplateType, PrismaClient } from "@prisma/client";
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
    const data = JSON.stringify({
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: {
            preview_url: true,
            body: messageBody,
        },
    });

    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/${env.NEXT_PUBLIC_WHATSAPP_VERSION}/${env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID}/messages`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metaClient.accessToken}`,
        },
        data: data,
    };

    try {
        const response = await axios.request(config);

        if (response.status === 200) {
            return { success: true, toNumber, messageBody };
        } else {
            return { success: false, toNumber, messageBody };
        }
    } catch (error) {
        console.error("WhatsApp API not Active - ", { toNumber, messageBody });
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
        url: `https://graph.facebook.com/${env.NEXT_PUBLIC_WHATSAPP_VERSION}/${env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID}/messages`,
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
        body: 'Welcome to Megz Learning, {{name}}!\n\nWe\'re excited to have you join our community.\nStart exploring our courses and enhancing your skills today!',
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
        name: 'Added To Waiting List',
        type: MessageTemplateType.AddedToWaitingList,
        body: 'Hi {{name}},\n\nYou\'ve been added to the Waiting list for {{courseName}}.\nWe will notify you once a spot becomes available. Thank you for your patience!',
        placeholders: ['name', 'courseName'],
    },
    {
        name: 'Added To Group',
        type: MessageTemplateType.AddedToGroup,
        body: 'Hi {{name}},\n\nyou\'ve been successfully added to the group {{groupName}}.\nWe look forward to your participation and engagement in the sessions!',
        placeholders: ['name', 'groupName'],
    },
    {
        name: 'Session Starting Soon',
        type: MessageTemplateType.SessionStartingSoon,
        body: 'Hi {{name}},\n\nJust a reminder that your session for {{courseName}} at level {{levelName}} is Starting soon at {{sessionTime}}.\nPlease complete this short Quiz: {{quizLink}}\n\nYou can join the session on time from here: {{sessionLink}} ',
        placeholders: ['name', 'courseName', 'levelName', 'sessionTime', 'sessionLink', 'quizLink'],
    },
    {
        name: 'Session Started',
        type: MessageTemplateType.SessionStarted,
        body: 'Hi {{name}},\n\nYour session for {{courseName}} at level {{levelName}} has now started.\nPlease join from this link if you haven\'t: {{sessionLink}}\nEnjoy your learning experience!',
        placeholders: ['name', 'courseName', 'levelName', 'sessionLink'],
    },
    {
        name: 'Session Updated',
        type: MessageTemplateType.SessionUpdated,
        body: 'Hi {{name}},\n\nYour session for {{oldTime}} has changed to be at {{newTime}}.\nPlease join it on time from this link: {{sessionLink}}\nEnjoy your learning experience!',
        placeholders: ['name', 'oldTime', 'newTime', 'sessionLink'],
    },
    {
        name: 'Session Completed',
        type: MessageTemplateType.SessionCompleted,
        body: 'Hi {{name}},\n\nCongratulations on completing your session for {{courseName}} at level {{levelName}}! We hope you found it valuable and look forward to your feedback.\nDon\'t forget your Assignment! you can find it here: {{assignmentLink}}',
        placeholders: ['name', 'courseName', 'levelName', 'assignmentLink'],
    },
    {
        name: 'Group Completed',
        type: MessageTemplateType.GroupCompleted,
        body: 'Hi {{name}},\n\nThe group {{groupName}} has been Completed. Thank you for your participation!\nPlease complete your final test from the below link to get your certificate!\n{{finalTestLink}}',
        placeholders: ['name', 'groupName', 'finalTestLink'],
    },
    {
        name: 'Certificate Ready',
        type: MessageTemplateType.CertificateReady,
        body: 'Hi {{name}},\n\nCongratulations! your certificate for course {{courseName}} at level {{levelName}} is now ready!\nThank you for taking this learning journey with us and we\'re looking forward to help you with the rest of you learning neads.\n\nYou can view your certificate from this link: {{certificateLink}}',
        placeholders: ['name', "certificateLink", "courseName", "levelName"],
    },
];

export async function setupDefaultMessageTemplates(prisma: PrismaClient) {
    return {
        createdTemplates: await prisma.$transaction(messageTemplates.map(template => prisma.messageTemplate.upsert({
            where: { name: template.name },
            create: {
                name: template.name,
                type: template.type,
                body: template.body,
                placeholders: template.placeholders,
            },
            update: {
                name: template.name,
                type: template.type,
                body: template.body,
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
    [MessageTemplateType.AddedToWaitingList]: { name: string; courseName: string };
    [MessageTemplateType.AddedToGroup]: { name: string; groupName: string };
    [MessageTemplateType.SessionStartingSoon]: { name: string; courseName: string; sessionTime: string; quizLink: string; };
    [MessageTemplateType.SessionStarted]: { name: string; courseName: string; levelName: string; sessionLink: string; };
    [MessageTemplateType.SessionUpdated]: { name: string; newTime: string; oldTime: string; sessionLink: string; };
    [MessageTemplateType.SessionCompleted]: { name: string; courseName: string; levelName: string; assignmentLink: string; };
    [MessageTemplateType.GroupCompleted]: { name: string; groupName: string; finalTestLink: string; };
    [MessageTemplateType.CertificateReady]: { name: string; certificateLink: string; courseName: string; levelName: string; };
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

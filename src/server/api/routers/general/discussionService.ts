import { PrismaClient, Prisma, NotificationChannel, DiscussionType } from '@prisma/client';
import { TRPCError } from '@trpc/server';

// Create a discussion
export async function createDiscussion(prisma: PrismaClient, data: {
    type: DiscussionType;
    title?: string;
    zoomGroupId?: string;
    participantIds: string[];
    createdById: string;
}) {
    return prisma.discussion.create({
        data: {
            type: data.type,
            title: data.title,
            zoomGroupId: data.zoomGroupId,
            createdById: data.createdById,
            participants: {
                create: data.participantIds.map(userId => ({ userId })),
            },
        },
        include: {
            participants: { include: { user: true } },
        },
    });
}

// Get a discussion by Group ID and Student ID
export async function getDiscussionByGroupAndStudent(prisma: PrismaClient, groupId: string, studentId: string, currentUserId: string) {
    const discussion = await prisma.discussion.findFirst({
        where: { zoomGroupId: groupId, participants: { some: { userId: studentId } }, type: "StudentTeacherOneToOne" },
        include: {
            participants: { include: { user: true } },
        },
    });

    if (!discussion) {
        const group = await prisma.zoomGroup.findUnique({ where: { id: groupId }, include: { teacher: { include: { user: true } } } })
        if (!group?.teacher?.user.id) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' });

        return await prisma.discussion.create({
            data: {
                type: "StudentTeacherOneToOne",
                zoomGroupId: groupId,
                createdById: currentUserId,
                participants: {
                    createMany: { data: [{ userId: studentId }, { userId: group.teacher.user.id }] },
                },
            },
            include: {
                participants: { include: { user: true } },
            },
        });
    }

    return discussion
}

// Get a discussion by Group ID
export async function getDiscussionByGroupId(prisma: PrismaClient, groupId: string, currentUserId: string) {
    const discussion = await prisma.discussion.findFirst({
        where: { zoomGroupId: groupId, type: "Group" },
        include: {
            participants: { include: { user: true } },
        },
    });


    if (!discussion) {
        const group = await prisma.zoomGroup.findUnique({ where: { id: groupId }, include: { teacher: { include: { user: true } } } });
        if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' });

        const studentIds = group.studentIds;
        const teacherUserId = group.teacher?.user.id;
        if (!teacherUserId) throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher not found' });

        const userIds = studentIds.concat([teacherUserId]);

        return await prisma.discussion.create({
            data: {
                type: "Group",
                zoomGroupId: groupId,
                createdById: currentUserId,
                participants: {
                    createMany: {
                        data: userIds.map(userId => ({ userId }))
                    },
                },
            },
            include: {
                participants: { include: { user: true } },
            },
        });
    }

    return discussion
}

// Get a discussion by ID
export async function getDiscussionById(prisma: PrismaClient, id: string) {
    return prisma.discussion.findUnique({
        where: { id },
        include: {
            participants: { include: { user: true } },
            messages: {
                orderBy: { sentAt: 'desc' },
                take: 50,
                include: { sender: true, isReadBy: true },
            },
        },
    });
}

// Get a discussions by user ID
export async function getDiscussionsByUserId(
    prisma: PrismaClient,
    userId: string,
) {
    return prisma.discussion.findMany({
        where: {
            participants: {
                some: { userId },
            },
        },
        orderBy: { lastMessageAt: 'desc' },
        include: {
            participants: { include: { user: true } },
            messages: {
                orderBy: { sentAt: 'desc' },
                take: 1,
            },
        },
    });
}

// Update a discussion by ID
export async function updateDiscussion(prisma: PrismaClient, id: string, data: { title?: string; isActive?: boolean }) {
    return prisma.discussion.update({
        where: { id },
        data,
    });
}

// Delete a discussion by ID
export async function deleteDiscussion(prisma: PrismaClient, id: string) {
    return prisma.discussion.delete({ where: { id } });
}

// Add a participant to a discussion
export async function addParticipant(prisma: PrismaClient, discussionId: string, userId: string) {
    return prisma.discussionParticipant.create({
        data: { discussionId, userId },
    });
}

// Remove a participant from a discussion
export async function removeParticipant(prisma: PrismaClient, discussionParticipantId: string) {
    return prisma.discussionParticipant.delete({ where: { id: discussionParticipantId } });
}

// Send a message in a discussion
export async function sendMessage(prisma: PrismaClient, data: {
    discussionId: string;
    senderId: string;
    content: string;
    attachments?: string[];
}) {
    return prisma.discussionMessage.create({
        data: {
            discussionId: data.discussionId,
            senderId: data.senderId,
            content: data.content,
            attachments: data.attachments || [],
        },
    });
}

// Get messages for a discussion
export async function getMessages(prisma: PrismaClient, discussionId: string, options: { cursor?: { id: string }; limit?: number } = { limit: 50 }) {
    return prisma.discussionMessage.findMany({
        where: { discussionId },
        orderBy: { sentAt: 'desc' },
        take: options.limit! + 1,
        ...(options.cursor ? { cursor: options.cursor, skip: 1 } : {}),
        include: {
            sender: true,
            isReadBy: true,
        },
    });
}

// Mark a message as read
export async function markMessageRead(prisma: PrismaClient, messageId: string, userId: string) {
    return prisma.discussionMessageRead.update({
        where: {
            id: messageId,
        },
        data: { readAt: new Date() },
    });
}

// Delete a message by ID
export async function deleteMessage(prisma: PrismaClient, messageId: string) {
    return prisma.discussionMessage.delete({ where: { id: messageId } });
}

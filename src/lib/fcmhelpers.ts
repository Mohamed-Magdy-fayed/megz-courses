// This file contains helper functions for sending notifications using Firebase Cloud Messaging (FCM).
import { User } from "@prisma/client"

export type CommsUserData = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    studentFcmTokens: string[];
}

export const formatUserForComms = (user: Pick<User, "id" | "name" | "email" | "phone" | "fcmTokens">): CommsUserData => {
    return { studentEmail: user.email, studentName: user.name, studentPhone: user.phone, studentFcmTokens: user.fcmTokens, studentId: user.id }
}

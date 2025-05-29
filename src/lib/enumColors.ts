import { SeverityPillProps } from "@/components/ui/SeverityPill";
import { CourseStatuses, GroupStatus, LeadInteractionType, OrderStatus, SessionStatus, SupportTicketStatus, UserNoteStatus, UserNoteTypes, NotificationChannel, NotificationType, DiscussionType } from "@prisma/client";

export const validLeadInteractionsColors: (val: LeadInteractionType) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Call":
            return "primary";
        case "Chat":
            return "info";
        case "Meeting":
            return "success";
        default:
            return "muted";
    }
};
export const validDeviceTypesColors: (val: GroupStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Active":
            return "info";
        case "Cancelled":
            return "destructive";
        case "Completed":
            return "success";
        case "Inactive":
            return "primary";
        case "Paused":
            return "muted";
        default:
            return "background";
    }
};
export const validSessionStatusesColors: (val: SessionStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Ongoing":
            return "info";
        case "Cancelled":
            return "destructive";
        case "Completed":
            return "success";
        case "Scheduled":
            return "primary";
        case "Starting":
            return "info";
        default:
            return "background";
    }
};
export const validCourseStatusesColors: (val: CourseStatuses) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Ongoing":
            return "info";
        case "Cancelled":
            return "destructive";
        case "Completed":
            return "success";
        case "OrderCreated":
            return "primary";
        case "OrderPaid":
            return "primary";
        case "Postponded":
            return "muted";
        case "Refunded":
            return "destructive";
        case "Waiting":
            return "primary";
        default:
            return "background";
    }
};

export const validOrderStatusesColors: (val: OrderStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Paid":
            return "success";
        case "Cancelled":
            return "destructive";
        case "Pending":
            return "info";
        case "Refunded":
            return "destructive";
        default:
            return "background";
    }
};
export const validNoteTypesColors: (val: UserNoteTypes) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "ComplainLevel1":
            return "secondary";
        case "ComplainLevel2":
            return "primary";
        case "ComplainLevel3":
            return "destructive";
        case "Feedback":
            return "success";
        case "Info":
            return "info";
        case "Followup":
            return "primary";
        case "Query":
            return "muted";
        default:
            return "background";
    }
};
export const validNoteStatusColors: (val: UserNoteStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Created":
            return "primary";
        case "Closed":
            return "success";
        case "Opened":
            return "info";
        default:
            return "background";
    }
};
export const validSupportTicketStatusColors: (val: SupportTicketStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Closed":
            return "success";
        case "Opened":
            return "info";
        case "Created":
            return "primary";
        default:
            return "background";
    }
};
export const validNotificationTypesColors: (val: NotificationType) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Info":
            return "info";
        case "Success":
            return "success";
        case "Warning":
            return "primary"; // fallback, since 'warning' is not a valid color
        case "Error":
            return "destructive";
        case "Custom":
            return "muted";
        default:
            return "background";
    }
};

export const validNotificationChannelsColors: (val: NotificationChannel) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "InApp":
            return "primary";
        case "Email":
            return "info";
        case "Push":
            return "success";
        case "SMS":
            return "muted";
        default:
            return "background";
    }
};
export const validDiscussionTypesColors: (val: DiscussionType) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "StudentTeacherOneToOne":
            return "primary";
        case "Group":
            return "info";
        case "AdminPrivate":
            return "secondary";
        default:
            return "background";
    }
};

export const validGroupStatusColors: (val: GroupStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "Active":
            return "info";
        case "Cancelled":
            return "destructive";
        case "Completed":
            return "success";
        case "Inactive":
            return "muted";
        case "Paused":
            return "muted";
        case "Waiting":
            return "primary";
        default:
            return "background";
    }
};

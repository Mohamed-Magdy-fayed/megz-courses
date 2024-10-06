import { SeverityPillProps } from "@/components/overview/SeverityPill";
import { CourseStatuses, Devices, EvaluationFormTypes, GroupStatus, MaterialItemType, OrderStatus, SalesOperationStatus, SessionStatus, SupportTicketStatus, TrainerRole, UserNoteStatus, UserNoteTypes, UserType } from "@prisma/client";

export const validOperationStatusColors: (val: SalesOperationStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "assigned":
            return "secondary";
        case "cancelled":
            return "destructive";
        case "completed":
            return "success";
        case "created":
            return "primary";
        case "ongoing":
            return "info";
        default:
            return "muted";
    }
};
export const validDeviceTypesColors: (val: GroupStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "active":
            return "info";
        case "cancelled":
            return "destructive";
        case "completed":
            return "success";
        case "inactive":
            return "primary";
        case "paused":
            return "muted";
        default:
            return "background";
    }
};
export const validSessionStatusesColors: (val: SessionStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "ongoing":
            return "info";
        case "cancelled":
            return "destructive";
        case "completed":
            return "success";
        case "scheduled":
            return "primary";
        case "starting":
            return "info";
        default:
            return "background";
    }
};
export const validCourseStatusesColors: (val: CourseStatuses) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "ongoing":
            return "info";
        case "cancelled":
            return "destructive";
        case "completed":
            return "success";
        case "orderCreated":
            return "primary";
        case "orderPaid":
            return "primary";
        case "postponded":
            return "muted";
        case "refunded":
            return "destructive";
        case "waiting":
            return "primary";
        default:
            return "background";
    }
};

export const validOrderStatusesColors: (val: OrderStatus) => SeverityPillProps["color"] = (val) => {
    switch (val) {
        case "paid":
            return "success";
        case "cancelled":
            return "destructive";
        case "pending":
            return "info";
        case "refunded":
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
        case "closed":
            return "success";
        case "opened":
            return "info";
        case "created":
            return "primary";
        default:
            return "background";
    }
};

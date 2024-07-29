import { CourseStatuses, Devices, EvaluationFormTypes, GroupStatus, OrderStatus, SalesOperationStatus, SessionStatus, TrainerRole, UserNoteStatus, UserNoteTypes, UserType } from "@prisma/client";

export const validTrainerRoles = [TrainerRole.teacher, TrainerRole.tester] as const;
export const validUserTypes = [UserType.admin, UserType.chatAgent, UserType.salesAgent, UserType.student, UserType.teacher] as const;
export const validOperationStatus = [SalesOperationStatus.assigned, SalesOperationStatus.cancelled, SalesOperationStatus.completed, SalesOperationStatus.created, SalesOperationStatus.ongoing] as const;
export const validDeviceTypes = [Devices.desktop, Devices.mobile, Devices.tablet] as const;
export const validGroupStatuses = [GroupStatus.active, GroupStatus.cancelled, GroupStatus.inactive, GroupStatus.paused, GroupStatus.waiting, GroupStatus.completed] as const;
export const validSessionStatuses = [SessionStatus.scheduled, SessionStatus.starting, SessionStatus.ongoing, SessionStatus.completed, SessionStatus.cancelled] as const;
export const validCourseStatuses = [CourseStatuses.cancelled, CourseStatuses.completed, CourseStatuses.ongoing, CourseStatuses.postponded, CourseStatuses.refunded, CourseStatuses.waiting] as const;
export const validEvalFormTypes = [EvaluationFormTypes.assignment, EvaluationFormTypes.quiz, EvaluationFormTypes.placementTest, EvaluationFormTypes.finalTest] as const;
export const validOrderStatuses = [OrderStatus.cancelled, OrderStatus.paid, OrderStatus.pending, OrderStatus.refunded] as const;
export const validNoteTypes = [UserNoteTypes.ComplainLevel1, UserNoteTypes.ComplainLevel2, UserNoteTypes.ComplainLevel3, UserNoteTypes.Feedback, UserNoteTypes.Followup, UserNoteTypes.Info, UserNoteTypes.Query] as const;
export const validNoteStatus = [UserNoteStatus.Closed, UserNoteStatus.Created, UserNoteStatus.Opened] as const;
export const validTrueOrFalse = ["true", "false"] as const;

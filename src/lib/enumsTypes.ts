import { CourseLevels, Devices, SalesOperationStatus, TrainerRole, UserType } from "@prisma/client";

export const validTrainerRoles = [TrainerRole.teacher, TrainerRole.tester] as const;
export const validUserTypes = [UserType.admin, UserType.chatAgent, UserType.salesAgent, UserType.student, UserType.teacher] as const;
export const validOperationStatus = [SalesOperationStatus.assigned, SalesOperationStatus.cancelled, SalesOperationStatus.completed, SalesOperationStatus.created, SalesOperationStatus.ongoing] as const;
export const validDeviceTypes = [Devices.desktop, Devices.mobile, Devices.tablet] as const;
export const validLevelTypes = [CourseLevels.A0_A1_Beginner_Elementary, CourseLevels.A2_Pre_Intermediate, CourseLevels.B1_Intermediate, CourseLevels.B2_Upper_Intermediate, CourseLevels.C1_Advanced, CourseLevels.C2_Proficient] as const;

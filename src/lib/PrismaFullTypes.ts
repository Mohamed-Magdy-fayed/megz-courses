import { Course, ZoomGroup, Order, PlacementTest, Trainer, MaterialItem, EvaluationForm, User } from "@prisma/client"

export type FullCourseType = Course & {
    zoomGroup: ZoomGroup[];
    orders: (Order & {
        user: User;
    })[];
    placementTests: (PlacementTest & {
        trainer: (Trainer & {
            user: User;
        }) | null;
        student: User;
    })[];
    materialItems: (MaterialItem & {
        evaluationForms: EvaluationForm[];
    })[];
}
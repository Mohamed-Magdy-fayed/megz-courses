import AppLayout from "@/components/pages/adminLayout/AppLayout";
import type { NextPage } from "next";
import OrdersClient from "@/components/admin/salesManagement/orders/OrdersClient";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { z } from "zod";

export const createOrderInput = z
    .object({
        studentId: z.string().optional(),
        studentData: z.object({
            studentEmail: z.string(),
            studentName: z.string(),
            studentPhone: z.string(),
        }).optional(),
        productId: z.string(),
        isPrivate: z.boolean(),
    })
    .refine(data => data.studentId || data.studentData, {
        message: "Either studentId or studentData must be provided.",
    })

const OrderPage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <ConceptTitle>Orders</ConceptTitle>
                    <OrdersClient />
                </div>
            </main>
        </AppLayout>
    );
}

export default OrderPage
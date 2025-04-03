import AppLayout from "@/components/pages/adminLayout/AppLayout";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import OrdersClient from "@/components/admin/salesManagement/orders/OrdersClient";
import { ConceptTitle } from "@/components/ui/Typoghraphy";

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
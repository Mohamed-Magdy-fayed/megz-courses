import AppLayout from "@/components/layout/AppLayout";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import OrdersClient from "@/components/orders/OrdersClient";
import { ConceptTitle } from "@/components/ui/Typoghraphy";

const OrderPage: NextPage = () => {
    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <ConceptTitle>Orders</ConceptTitle>
                    <PaperContainer>
                        <OrdersClient />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default OrderPage
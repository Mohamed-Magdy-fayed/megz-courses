import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { csvMaker } from "@/lib/csvMaker";
import OrdersClient from "@/components/orders/OrdersClient";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const OrderPage: NextPage = () => {
    const { data, isLoading, isError } = api.orders.getAll.useQuery();

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Orders</ConceptTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={"icon"}
                                    customeColor={"infoIcon"}
                                    onClick={() => data?.orders && csvMaker(data?.orders)}
                                >
                                    <FileDown />
                                </Button>
                            </div>
                        </div>
                        <Card className="flex flex-col lg:flex-row flex-grow w-80">
                            <CardHeader>
                                All Orders States
                            </CardHeader>
                            <Separator orientation="vertical" className="hidden lg:block" />
                            <CardContent className="flex items-center w-full justify-between p-4 gap-4 overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary">
                                <Typography>
                                    Count: {data?.orders.length}
                                </Typography>
                                <Separator orientation="vertical" />
                                <Typography>
                                    Paid: {data?.orders.filter(order => order.status === "paid").length}
                                </Typography>
                                <Separator orientation="vertical" />
                                <Typography>
                                    Pending: {data?.orders.filter(order => order.status === "pending").length}
                                </Typography>
                                <Separator orientation="vertical" />
                                <Typography>
                                    Cancelled: {data?.orders.filter(order => order.status === "cancelled").length}
                                </Typography>
                                <Separator orientation="vertical" />
                                <Typography>
                                    Refunded: {data?.orders.filter(order => order.status === "refunded").length}
                                </Typography>
                            </CardContent>
                            <Separator orientation="vertical" className="hidden lg:block" />
                            <CardFooter className="p-4">
                                Total Revenue: {formatPrice(data?.orders.map(order => order.status === "paid" ? order.amount : 0).reduce((a, b) => a + b, 0)!)}
                            </CardFooter>
                        </Card>
                    </div>
                    <PaperContainer>
                        {isLoading ? (
                            <Spinner></Spinner>
                        ) : isError ? (
                            <>Error</>
                        ) : (
                            <OrdersClient data={data.orders}></OrdersClient>
                        )}
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default OrderPage
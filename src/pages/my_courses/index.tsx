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

const CoursesPage: NextPage = () => {
    const { data, isLoading, isError } = api.courses.getAll.useQuery();

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Courses</ConceptTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={"icon"}
                                    customeColor={"infoIcon"}
                                    onClick={() => data?.courses && csvMaker(data?.courses)}
                                >
                                    <FileDown />
                                </Button>
                            </div>
                        </div>
                        <Card className="flex">
                            <CardHeader>
                                All Courses States
                            </CardHeader>
                            <Separator orientation="vertical" />
                            <CardContent className="flex items-center justify-between p-4 gap-4">
                                <Typography>
                                    Count: {data?.courses.length}
                                </Typography>
                                <Separator orientation="vertical" />
                                <Typography>
                                    Orders: {data?.courses.filter(course => course.orderIds).length}
                                </Typography>
                                <Separator orientation="vertical" />
                            </CardContent>
                        </Card>
                    </div>
                    <PaperContainer>
                        {isLoading ? (
                            <Spinner></Spinner>
                        ) : isError ? (
                            <>Error</>
                        ) : (
                            <>
                                {/* <OrdersClient data={data.courses}></OrdersClient> */}
                            </>
                        )}
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default CoursesPage
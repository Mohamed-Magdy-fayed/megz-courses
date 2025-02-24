import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import LatestOrdersClient from "./ordersOverviewComponents/OrdersOverviewClient";
import Link from "next/link";

export const LatestOrdersOverview = () => {
  return (
    <Card className="col-span-12 md:col-span-6 xl:col-span-8 flex flex-col">
      <CardHeader >
        <Typography variant={"secondary"}>Latest Orders</Typography>
      </CardHeader>
      <CardContent className="flex-grow">
        <LatestOrdersClient />
      </CardContent>
      <Separator />
      <CardFooter className="justify-end p-4">
        <Link href={`/admin/sales_management/orders`}>
          <Button>
            <ArrowRight />
            <Typography variant={"buttonText"}>View all</Typography>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

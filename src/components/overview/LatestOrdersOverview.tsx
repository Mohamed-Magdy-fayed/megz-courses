import { format } from "date-fns";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import { api } from "@/lib/api";
import Spinner from "../Spinner";
import LatestOrdersClient from "./ordersOverviewComponents/OrdersOverviewClient";

export const LatestOrdersOverview = () => {
  const { data: orders } = api.orders.getAll.useQuery()
  return (
    <Card className="col-span-12 md:col-span-6 lg:col-span-8">
      <CardHeader >
        <Typography variant={"secondary"}>Latest Orders</Typography>
      </CardHeader>
      <CardContent>
        {!orders?.orders ? <Spinner /> : (
          <LatestOrdersClient data={orders.orders.slice(0, 10)} />
        )}
      </CardContent>
      <Separator />
      <CardFooter className="justify-end p-4">
        <Button>
          <ArrowRight />
          <Typography variant={"buttonText"}>View all</Typography>
        </Button>
      </CardFooter>
    </Card>
  );
};

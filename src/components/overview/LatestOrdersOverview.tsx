import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import { api } from "@/lib/api";
import Spinner from "../Spinner";
import LatestOrdersClient from "./ordersOverviewComponents/OrdersOverviewClient";
import Link from "next/link";
import { useEffect } from "react";

export const LatestOrdersOverview = () => {
  const { data: orders, refetch } = api.orders.getLatest.useQuery(undefined, { enabled: false })

  useEffect(() => {
    refetch()
  }, [])

  return (
    <Card className="col-span-12 md:col-span-6 xl:col-span-8">
      <CardHeader >
        <Typography variant={"secondary"}>Latest Orders</Typography>
      </CardHeader>
      <CardContent>
        {!orders?.orders ? <Spinner className="w-full" /> : (
          <LatestOrdersClient data={orders.orders.slice(0, 10)} />
        )}
      </CardContent>
      <Separator />
      <CardFooter className="justify-end p-4 mt-auto">
        <Link href={`/orders`}>
          <Button>
            <ArrowRight />
            <Typography variant={"buttonText"}>View all</Typography>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

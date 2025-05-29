"use client";

import { useEffect } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { api } from "@/lib/api";
import { formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DateRange } from "@/pages/admin/dashboard";

const chartConfig: ChartConfig = {
  thisYear: {
    label: "This Year",
    color: "hsl(var(--chart-1))",
  },
  lastYear: {
    label: "Last Year",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function SalesOverview({ dateRange }: { dateRange: DateRange }) {
  const { data, refetch } = api.analytics.getSalesPerMonth.useQuery(
    dateRange ? { from: dateRange.from, to: dateRange.to } : undefined,
    { enabled: false }
  );

  useEffect(() => { refetch() }, [dateRange, refetch]);

  return (
    <Card className="col-span-12 xl:col-span-8">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>
          {dateRange ? (
            <>
              {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
            </>
          ) : (
            "All Time"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={data?.result}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="thisYear" fill="var(--color-thisYear)" radius={4} />
            <Bar dataKey="lastYear" fill="var(--color-lastYear)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {typeof data?.trend === "number" && (
          <div className="flex gap-2 font-medium leading-none">
            Trending {data.trend >= 0 ? "up" : "down"} by {formatPercentage(data.trend)} this month{" "}
            {data.trend > 0 ? (
              <TrendingUpIcon className="h-4 w-4" />
            ) : (
              <TrendingDownIcon className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
        <div className="leading-none text-muted">
          Showing total sales for the last 2 years
        </div>
      </CardFooter>
    </Card>
  );
}
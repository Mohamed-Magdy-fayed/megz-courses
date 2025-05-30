"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { api } from "@/lib/api"
import { DateRange } from "@/pages/admin/dashboard"
import { format } from "date-fns"

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-3))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function TrafficOverview({ dateRange }: { dateRange: DateRange }) {
  const { data, refetch } = api.analytics.getDeviceTraffic.useQuery(
    dateRange ? { from: dateRange.from, to: dateRange.to } : undefined,
    { enabled: false }
  );

  const totalVisitors = Array.isArray(data)
    ? data.reduce((sum, item) => sum + (item.visitors ?? 0), 0)
    : 0;

  React.useEffect(() => { refetch() }, [dateRange, refetch]);

  return (
    <Card className="flex flex-col col-span-12 xl:col-span-4">
      <CardHeader className="pb-0">
        <CardTitle>Visitors Devices</CardTitle>
        <CardDescription>
          {dateRange ? (
            <>
              {format(dateRange.from, "MMMM-yyyy")} - {format(dateRange.to, "MMMM-yyyy")}
            </>
          ) : (
            "All Time"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[500px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="visitors"
              nameKey="device"
              innerRadius={80}
              strokeWidth={20}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

import { Chart } from "@/components/overview/Chart";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveRight, RefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";

const useChartOptions = () => {
  return {
    title: {
      text: "sales",
      style: {
        color: "var(--muted)",
        fontSize: "32px"
      }
    },
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: {
        show: true,
        offsetY: 15,
      },
    },
    colors: [
      "var(--primary)",
      "var(--muted)",
    ],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
      type: "solid",
    },
    grid: {
      borderColor: "var(--foreground)",
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      show: true,
      offsetY: 5
    },
    plotOptions: {
      bar: {
        columnWidth: "80px",
        borderRadius: 5,
      },
    },
    xaxis: {
      axisBorder: {
        color: "var(--foreground)",
        show: true,
        offsetY: 5
      },
      axisTicks: {
        color: "var(--foreground)",
        show: true,
      },
      offsetY: 5,
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        offsetY: -2,
      },
    },
    yaxis: {
      axisBorder: {
        color: "var(--foreground)",
        show: true,
      },
      axisTicks: {
        color: "var(--foreground)",
        show: true
      },
      labels: {
        offsetX: -5,
        formatter: (value: any) => (value > 1000 ? `${value / 1000}K` : `${value}`),
        style: {
          colors: "var(--foreground)",
        },
      },
    },
  };
};

interface SalsesOverviewProps {
  chartSeries: any[];
}

export const SalesOverview = ({ chartSeries }: SalsesOverviewProps) => {
  const chartOptions = useChartOptions();

  return (
    <Card className="col-span-12 xl:col-span-8">
      <CardHeader>
        <Button variant={"default"}>
          <RefreshCcw />
          <Typography variant={"buttonText"}>Sync</Typography>
        </Button>
      </CardHeader>
      <CardContent>
        <Chart
          height={350}
          options={{ ...chartOptions }}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </CardContent>
      <Separator />
      <CardFooter className="flex items-center justify-end p-4">
        <Button variant={"default"}>
          <MoveRight />
          <Typography variant={"buttonText"}>Overview</Typography>
        </Button>
      </CardFooter>
    </Card >
  );
};

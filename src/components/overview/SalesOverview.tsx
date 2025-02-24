import { Chart } from "@/components/overview/Chart";
import { Card, CardContent } from "@/components/ui/card";

const useChartOptions = (): ApexCharts.ApexOptions => {
  return {
    title: {
      text: "Sales",
      style: {
        color: "hsl(var(--muted))",
        fontSize: "20px"
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
      "hsl(var(--primary))",
      "hsl(var(--muted))",
    ],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
      type: "solid",
    },
    grid: {
      borderColor: "hsl(var(--foreground))",
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
        columnWidth: "28px",
        borderRadius: 2,
      },
    },
    xaxis: {
      axisBorder: {
        color: "hsl(var(--foreground))",
        show: true,
        offsetY: 5
      },
      axisTicks: {
        color: "hsl(var(--foreground))",
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
        color: "hsl(var(--foreground))",
        show: true,
      },
      axisTicks: {
        color: "hsl(var(--foreground))",
        show: true
      },
      labels: {
        offsetX: -5,
        formatter: (value: number) => {
          const formatter = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
          });

          if (value > 1000) {
            return formatter.format(value / 1000) + 'K';
          } else {
            return formatter.format(value);
          }
        },
        style: {
          colors: "hsl(var(--foreground))",
        },
      },
    },
  };
};

interface SalsesOverviewProps {
  chartSeries: any[];
  sync: () => void
}

export const SalesOverview = ({ chartSeries, sync }: SalsesOverviewProps) => {
  const chartOptions = useChartOptions();

  return (
    <Card className="col-span-12 xl:col-span-8">
      <CardContent className="grid py-4">
        <Chart
          height={400}
          options={{ ...chartOptions }}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </CardContent>
    </Card >
  );
};

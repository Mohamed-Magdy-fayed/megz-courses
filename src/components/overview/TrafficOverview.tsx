import { Chart } from "@/components/overview/Chart";
import { Laptop, Smartphone, TabletIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/Typoghraphy";

const useChartOptions = (labels: string[]) => {
  return {
    chart: {
      background: "transparent",
    },
    dataLabels: {
      enabled: false
    },
    labels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      Active: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    stroke: {
      width: 5,
    },
    theme: {
    },
    tooltip: {
      fillSeriesColor: false,
    },
  };
};

const iconMap = {
  Desktop: (
    <Laptop />
  ),
  Tablet: (
    <TabletIcon />
  ),
  Phone: (
    <Smartphone />
  ),
};

interface TrafficOverviewProps {
  chartSeries: number[];
  labels: string[];
}

export const TrafficOverview = ({
  chartSeries,
  labels,
}: TrafficOverviewProps) => {
  const chartOptions = useChartOptions(labels);

  return (
    <Card className="col-span-12 xl:col-span-4">
      <CardHeader>
        <Typography variant={"secondary"}>Traffic Source</Typography>
      </CardHeader>
      <CardContent>
        <Chart
          height={300}
          options={chartOptions}
          series={chartSeries}
          type="donut"
          width="100%"
        />
        <div
          className="items-center flex justify-center gap-4 mt-2"
        >
          {chartSeries.map((item, index) => {
            const label = labels[index] as keyof typeof iconMap;
            if (!label) return;

            return (
              <div
                key={label}
                className="flex flex-col items-center"
              >
                {iconMap[label]}
                <Typography className="my-1" variant="buttonText">
                  {label}
                </Typography>
                <Typography variant="bodyText">
                  {item || 0}%
                </Typography>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => null,
});

export const Chart = ApexChart;

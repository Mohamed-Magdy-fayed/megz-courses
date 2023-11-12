import StatesOverview from "./StatesOverview";
import { SalesOverview } from "./SalesOverview";
import { TrafficOverview } from "./TrafficOverview";
import { LatestCourseOverview } from "./LatestCourseOverview";
import { LatestOrdersOverview } from "./LatestOrdersOverview";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [monthlyTotalsThisYear, setMonthlyTotalsThisYear] = useState<number[]>([]);
  const [monthlyTotalsLastYear, setMonthlyTotalsLastYear] = useState<number[]>([]);
  const [mobilePercentage, setMobilePercentage] = useState(0);
  const [desktopPercentage, setDesktopPercentage] = useState(100);

  const refetchSales = api.orders.getAll.useQuery(undefined, { enabled: false }).refetch()
  const refetchSources = api.analytics.getSources.useQuery(undefined, { enabled: false }).refetch()

  const fetchData = async () => {
    try {
      const [orders, analyticsData] = await Promise.all([refetchSales, refetchSources]);

      if (!orders.data?.orders || !analyticsData.data?.data) {
        return;
      }

      const thisYear = new Date().getFullYear();
      const lastYear = thisYear - 1;

      const monthlyTotalsThisYear = new Array(12).fill(0);
      const monthlyTotalsLastYear = new Array(12).fill(0);

      orders.data.orders.forEach((order) => {
        const orderYear = order.createdAt.getFullYear();
        const orderMonth = order.createdAt.getMonth();
        const orderAmount = order.amount;

        if (orderYear === thisYear) {
          monthlyTotalsThisYear[orderMonth] += orderAmount;
        } else if (orderYear === lastYear) {
          monthlyTotalsLastYear[orderMonth] += orderAmount;
        }
      });

      setMonthlyTotalsThisYear(monthlyTotalsThisYear);
      setMonthlyTotalsLastYear(monthlyTotalsLastYear);

      const totalUsers = analyticsData.data?.data.length;
      const mobileUsers = analyticsData.data?.data.filter((item) => item.device === "mobile").length;
      const desktopUsers = analyticsData.data?.data.filter((item) => item.device === "desktop").length;

      setMobilePercentage((mobileUsers / totalUsers) * 100);
      setDesktopPercentage((desktopUsers / totalUsers) * 100);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="grid grid-cols-12 gap-8 w-full" >
        <StatesOverview></StatesOverview>
        <SalesOverview
          sync={fetchData}
          chartSeries={[
            {
              name: "This year",
              data: monthlyTotalsThisYear,
            },
            {
              name: "Last year",
              data: monthlyTotalsLastYear,
            },
          ]}
        />
        <TrafficOverview
          chartSeries={[desktopPercentage, mobilePercentage]}
          labels={["Desktop", "Phone"]}
        />
        <LatestCourseOverview />
        <LatestOrdersOverview />
      </div>
    </>
  );
}

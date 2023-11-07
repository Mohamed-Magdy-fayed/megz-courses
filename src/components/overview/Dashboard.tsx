import StatesOverview from "./StatesOverview";
import { SalesOverview } from "./SalesOverview";
import { TrafficOverview } from "./TrafficOverview";
import { LatestCourseOverview } from "./LatestCourseOverview";
import { LatestOrdersOverview } from "./LatestOrdersOverview";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";

export default function Dashboard() {
  const { refetch } = api.orders.getAll.useQuery(undefined, { enabled: false })
  const [monthlyTotalsThisYear, setMonthlyTotalsThisYear] = useState<any>([]);
  const [monthlyTotalsLastYear, setMonthlyTotalsLastYear] = useState<any>([]);

  const getMonthlyOrderTotals = (orders: (Order & {
    user: User;
    salesOperation: SalesOperation & {
      assignee: SalesAgent | null;
    };
    courses: Course[];
  })[]) => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const monthlyTotalsThisYear = new Array(12).fill(0);
    const monthlyTotalsLastYear = new Array(12).fill(0);

    orders.forEach((order) => {
      const orderYear = order.createdAt.getFullYear();
      const orderMonth = order.createdAt.getMonth();
      const orderAmount = order.amount;

      if (orderYear === thisYear) {
        monthlyTotalsThisYear[orderMonth] += orderAmount;
      } else if (orderYear === lastYear) {
        monthlyTotalsLastYear[orderMonth] += orderAmount;
      }
    });

    return {
      monthlyTotalsThisYear,
      monthlyTotalsLastYear,
    };
  };

  const sync = () => {
    refetch()
      .then(res => {
        if (!res.data?.orders) return
        const { monthlyTotalsThisYear, monthlyTotalsLastYear } = getMonthlyOrderTotals(res.data?.orders);

        // Set the states with the calculated values
        const formattedThisYearTotals = monthlyTotalsThisYear.map(total => (total).toFixed());
        const formattedLastYearTotals = monthlyTotalsLastYear.map(total => (total).toFixed());
        setMonthlyTotalsThisYear(formattedThisYearTotals);
        setMonthlyTotalsLastYear(formattedLastYearTotals);
      })
  }

  useEffect(() => {
    sync()
  }, [])

  return (
    <>
      <div className="grid grid-cols-12 gap-8 w-full" >
        <StatesOverview></StatesOverview>
        <SalesOverview
          sync={sync}
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
          chartSeries={[63, 15, 22]}
          labels={["Desktop", "Tablet", "Phone"]}
        />
        <LatestCourseOverview />
        <LatestOrdersOverview />
      </div>
    </>
  );
}

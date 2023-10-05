import StatesOverview from "./StatesOverview";
import { SalesOverview } from "./SalesOverview";
import { TrafficOverview } from "./TrafficOverview";
import { LatestCourseOverview } from "./LatestCourseOverview";
import { subDays, subHours } from "date-fns";
import { LatestOrdersOverview } from "./LatestOrdersOverview";

const now = new Date();

export default function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-12 gap-8 w-full" >
        <StatesOverview></StatesOverview>
        <SalesOverview
          chartSeries={[
            {
              name: "This year",
              data: [18000, 16000, 5000, 8000, 3000, 14000, 14000, 16000, 17000, 19000, 18000, 20000],
            },
            {
              name: "Last year",
              data: [12000, 11000, 4000, 6000, 2000, 9000, 9000, 10000, 11000, 12000, 13000, 13000],
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

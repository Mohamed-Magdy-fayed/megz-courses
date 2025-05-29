import StatesOverview from "./StatesOverview";
import { SalesOverview } from "./SalesOverview";
import { TrafficOverview } from "./TrafficOverview";
import { LatestCourseOverview } from "./LatestCourseOverview";
import { LatestOrdersOverview } from "./LatestOrdersOverview";
import { DateRange } from "@/pages/admin/dashboard";

export default function Dashboard({ dateRange }: { dateRange: DateRange }) {
  return (
    <div className="grid grid-cols-12 gap-8 w-full" >
      <StatesOverview dateRange={dateRange} />
      <SalesOverview dateRange={dateRange} />
      <TrafficOverview dateRange={dateRange} />
      <LatestCourseOverview />
      <LatestOrdersOverview />
    </div>
  );
}

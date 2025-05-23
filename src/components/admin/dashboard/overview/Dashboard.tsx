import StatesOverview from "./StatesOverview";
import { SalesOverview } from "./SalesOverview";
import { TrafficOverview } from "./TrafficOverview";
import { LatestCourseOverview } from "./LatestCourseOverview";
import { LatestOrdersOverview } from "./LatestOrdersOverview";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-8 w-full" >
      <StatesOverview />
      <SalesOverview />
      <TrafficOverview />
      <LatestCourseOverview />
      <LatestOrdersOverview />
    </div>
  );
}

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
        <LatestCourseOverview
          courses={[
            {
              id: "5ece2c077e39da27658aa8a9",
              image: "/product-1.png",
              name: "Healthcare Erbology",
              updatedAt: subHours(now, 6).getTime(),
            },
            {
              id: "5ece2c0d16f70bff2cf86cd8",
              image: "/product-2.png",
              name: "Makeup Lancome Rouge",
              updatedAt: subDays(subHours(now, 8), 2).getTime(),
            },
            {
              id: "b393ce1b09c1254c3a92c827",
              image: "/product-5.png",
              name: "Skincare Soja CO",
              updatedAt: subDays(subHours(now, 1), 1).getTime(),
            },
            {
              id: "a6ede15670da63f49f752c89",
              image: "/product-6.png",
              name: "Makeup Lipstick",
              updatedAt: subDays(subHours(now, 3), 3).getTime(),
            },
            {
              id: "bcad5524fe3a2f8f8620ceda",
              image: "/product-7.png",
              name: "Healthcare Ritual",
              updatedAt: subDays(subHours(now, 5), 6).getTime(),
            },
          ]}
        />
        <LatestOrdersOverview />
      </div>
    </>
  );
}

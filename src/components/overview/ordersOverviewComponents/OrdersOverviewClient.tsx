import { Course, SalesAgent, SalesOperation, User, Order } from "@prisma/client";
import { format } from "date-fns";
import { columns } from "./OrdersOverviewColumns";
import { DataTable } from "@/components/ui/DataTable";

export interface Orders extends Order {
  user: User;
  salesOperation: SalesOperation & {
    assignee: SalesAgent | null;
  };
  course: Course;
}


const LatestOrdersClient = ({ data }: { data: Orders[] }) => {
  const formattedData = data.map((order) => ({
    orderId: order.id,
    userId: order.user.id,
    orderNumber: order.orderNumber,
    userName: order.user.name,
    createdAt: format(order.createdAt, "dd MMM yyyy"),
    status: order.status,
  }));


  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={() => { }}
      onDelete={() => { }}
      searches={[{
        key: "orderNumber",
        label: "Order Number"
      }]}
    />
  );
};

export default LatestOrdersClient;

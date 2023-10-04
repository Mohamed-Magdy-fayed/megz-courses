import { useState } from "react";
import { Course, SalesAgent, SalesOperation, User, Order } from "@prisma/client";
import { format } from "date-fns";
import { OrderColmun, columns } from "./OrdersOverviewColumns";
import { DataTable } from "@/components/ui/DataTable";

export interface Orders extends Order {
  user: User;
  salesOperation: SalesOperation & {
    assignee: SalesAgent | null;
  };
  courses: Course[];
}


const LatestOrdersClient = ({ data }: { data: Orders[] }) => {
  const [users, setUsers] = useState<OrderColmun[]>([]);
  const formattedData = data.map((order) => ({
    orderId: order.id,
    userId: order.user.id,
    orderNumber: order.orderNumber,
    userName: order.user.name,
    createdAt: format(order.createdAt, "dd MMM yyyy"),
    status: order.status,
  }));

  const onDelete = () => { }

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={setUsers}
      onDelete={onDelete}
    />
  );
};

export default LatestOrdersClient;

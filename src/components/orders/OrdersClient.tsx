import { columns } from "./OrdersColumn";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { DataTable } from "../ui/DataTable";

const OrdersClient = ({ data }: {
  data: (Order & {
    user: User;
    salesOperation: SalesOperation & {
      assignee: SalesAgent | null;
    };
    courses: Course[];
  })[]
}) => {

  const formattedData = data.map(({
    amount,
    courses,
    id,
    orderNumber,
    paymentId,
    salesOperation,
    status,
    user,
    updatedAt,
  }) => ({
    id,
    amount,
    orderNumber,
    paymentId: paymentId || "",
    salesOperationId: salesOperation.id,
    salesOperationCode: salesOperation.code,
    status,
    userName: user.name,
    userEmail: user.email,
    userImage: user.image || "",
    courses,
    updatedAt,
  }))

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={() => { }}
      onDelete={() => { }}
      search={{ key: "orderNumber", label: "Order Number" }}
    />
  );
};

export default OrdersClient;

import { OrderRow, columns } from "./OrdersColumn";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { DataTable } from "../ui/DataTable";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";

const OrdersClient = ({ data }: {
  data: (Order & {
    user: User;
    salesOperation: SalesOperation & {
      assignee: SalesAgent | null;
    };
    courses: Course[];
  })[]
}) => {
  const [orders, setOrders] = useState<OrderRow[]>([])

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

  const trpcUtils = api.useContext()
  const deleteMutation = api.orders.deleteOrders.useMutation()
  const { toast } = useToast()

  const onDelete = () => {
    deleteMutation.mutate(
      orders.map(or => or.id),
      {
        onSuccess: (data) => {
          toast({
            variant: "success",
            description: `Deleted ${data.deletedOrders.count} order(s)`
          })
          trpcUtils.orders.invalidate()
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            description: e.message
          })
        },
      }
    )
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={setOrders}
      onDelete={onDelete}
      search={{ key: "orderNumber", label: "Order Number" }}
    />
  );
};

export default OrdersClient;

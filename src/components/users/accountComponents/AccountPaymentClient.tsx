import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { Order, columns } from "./AccountPaymentsColumn";

const AccountPaymentClient = ({ data }: { data: Order[] }) => {
  const [orders, setOrders] = useState<Order[]>(data);
  const formattedData = data.map((order) => ({
    id: order.id,
    amount: order.amount,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  const { toastError, toastSuccess } = useToast();
  const deleteMutation = api.orders.deleteOrders.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = async () => {
    deleteMutation.mutate(orders.map(order => order.id),
      {
        onSuccess: () => {
          trpcUtils.users.invalidate().then(() => toastSuccess("Order(s) deleted"))
        },
        onError: (error) => {
          toastError(error.message);
        },
      }
    );
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

export default AccountPaymentClient;

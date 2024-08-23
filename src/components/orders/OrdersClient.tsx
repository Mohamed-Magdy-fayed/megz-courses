import { OrderRow, columns } from "./OrdersColumn";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { DataTable } from "../ui/DataTable";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";
import { validOrderStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";
import { useSession } from "next-auth/react";

const OrdersClient = ({ data }: {
  data: (Order & {
    user: User;
    salesOperation: SalesOperation & {
      assignee: SalesAgent | null;
    };
    course: Course;
  })[]
}) => {
  const [orders, setOrders] = useState<OrderRow[]>([])

  const { data: sessionData } = useSession()
  const formattedData = data.map(({
    amount,
    course,
    id,
    orderNumber,
    paymentId,
    salesOperation,
    status,
    user,
    refundRequester,
    updatedAt,
  }) => ({
    isStudentView: sessionData?.user.userType === "student",
    id,
    amount,
    orderNumber,
    paymentId: paymentId || "",
    salesOperationId: salesOperation.id,
    salesOperationCode: salesOperation.code,
    status,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userImage: user.image || "",
    refundRequester,
    course,
    updatedAt,
  }))

  const trpcUtils = api.useContext()
  const deleteMutation = api.orders.deleteOrders.useMutation()
  const { toastError, toastSuccess } = useToast()

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      orders.map(or => or.id),
      {
        onSuccess: (data) => {
          trpcUtils.orders.invalidate()
            .then(() => {
              callback?.()
              toastSuccess(`Deleted ${data.deletedOrders.count} order(s)`)
            })
        },
        onError: (error) => {
          toastError(error.message)
        },
      }
    )
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={setOrders}
      onDelete={onDelete}
      searches={[{ key: "orderNumber", label: "Order Number" }]}
      filters={[{
        key: "status", filterName: "Status", values: [...validOrderStatuses.map(status => ({
          label: upperFirst(status),
          value: status,
        }))]
      }]}
    />
  );
};

export default OrdersClient;

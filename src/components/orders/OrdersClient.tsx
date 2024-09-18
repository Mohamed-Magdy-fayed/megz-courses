import { OrderRow, columns } from "./OrdersColumn";
import { DataTable } from "../ui/DataTable";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";
import { validOrderStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";
import { useSession } from "next-auth/react";

const OrdersClient = ({ userId }: { userId?: string }) => {
  const [orders, setOrders] = useState<OrderRow[]>([])

  const { data: sessionData } = useSession()

  const trpcUtils = api.useContext()
  const { data, isLoading } = !userId ? api.orders.getAll.useQuery() : api.orders.getByUserId.useQuery({ userId })
  const deleteMutation = api.orders.deleteOrders.useMutation()
  const { toastError, toastSuccess } = useToast()

  const formattedData = data?.orders.map(({
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
    courseId: course.id,
    updatedAt,
  })) || []

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
      skele={isLoading}
      columns={columns}
      data={formattedData}
      setData={setOrders}
      onDelete={onDelete}
      sum={{ key: "amount", label: "Total" }}
      dateRanges={[{ key: "updatedAt", label: "Payment Date" }]}
      searches={[
        { key: "orderNumber", label: "Order Number" },
        { key: "userName", label: "User Name" },
        { key: "salesOperationCode", label: "Operation Code" },
      ]}
      filters={[
        {
          key: "status", filterName: "Status", values: [...validOrderStatuses.map(status => ({
            label: upperFirst(status),
            value: status,
          }))]
        },
        {
          key: "courseId", filterName: "Course", values: [...formattedData.map(d => d.course.id)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(id => ({
              label: formattedData.find(d => d.course.id === id)?.course.name || "",
              value: id,
            }))]
        }
      ]}
    />
  );
};

export default OrdersClient;

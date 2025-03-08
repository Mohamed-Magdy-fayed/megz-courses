import { api } from "@/lib/api";
import { useState } from "react";
import { validOrderStatuses } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/server/permissions";
import { orderColumns, OrderColumns } from "@/components/admin/salesManagement/orders/OrdersColumn";
import { toastType, useToast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/ui/DataTable";
import { createMutationOptions } from "@/lib/mutationsHelper";

const OrdersClient = ({ userId }: { userId?: string }) => {
  const [orders, setOrders] = useState<OrderColumns[]>([])
  const [loadingToast, setLoadingToast] = useState<toastType>()

  const { data: sessionData } = useSession()
  const { toast } = useToast()

  const trpcUtils = api.useUtils()
  const { data, isLoading } = !userId ? api.orders.getAll.useQuery() : api.orders.getByUserId.useQuery({ userId })
  const deleteMutation = api.orders.deleteOrders.useMutation(
    createMutationOptions({
      trpcUtils: trpcUtils.orders,
      toast,
      loadingToast,
      setLoadingToast,
      successMessageFormatter: ({ deletedOrders }) => `Deleted ${deletedOrders.count} order(s)`
    })
  )

  const formattedData: OrderColumns[] = data?.orders.map(({
    amount,
    course,
    product,
    payments,
    refunds,
    id,
    orderNumber,
    lead,
    status,
    user,
    refundRequester,
  }) => ({
    isStudentView: !!(sessionData?.user && !hasPermission(sessionData.user, "adminLayout", "view")),
    id,
    amount,
    paidAmount: payments.reduce((a, b) => a + b.paymentAmount, 0),
    refundedAmount: refunds.reduce((a, b) => a + b.refundAmount, 0),
    remainingAmount: amount - payments.reduce((a, b) => a + b.paymentAmount, 0) + refunds.reduce((a, b) => a + b.refundAmount, 0),
    paidAt: payments[0]?.createdAt,
    orderNumber,
    leadId: lead.id,
    leadCode: lead.code,
    status,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userImage: user.image || "",
    refundRequester,
    courseId: course?.id,
    courseSlug: course?.slug,
    courseName: course?.name,
    productName: product?.name,
    productId: product?.id,
  })) || []

  const onDelete = async (callback?: () => void) => {
    await deleteMutation.mutateAsync(orders.map(or => or.id))
    callback?.()
  };

  return (
    <DataTable
      skele={isLoading}
      columns={orderColumns}
      data={formattedData}
      setData={setOrders}
      onDelete={onDelete}
      sum={{ key: "amount", label: "Total" }}
      dateRanges={[{ key: "paidAt", label: "Payment Date" }]}
      searches={[
        { key: "orderNumber", label: "Order Number" },
        { key: "userName", label: "Student Name" },
        { key: "leadCode", label: "Lead Code" },
      ]}
      filters={[
        {
          key: "status", filterName: "Status", values: [...validOrderStatuses.map(status => ({
            label: upperFirst(status),
            value: status,
          }))]
        },
        {
          key: "courseId", filterName: "Course", values: [...formattedData.map(d => d.courseId)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(id => ({
              label: formattedData.find(d => d.courseId === id)?.courseName || "",
              value: id || "",
            }))]
        },
        {
          key: "productId", filterName: "Product", values: [...formattedData.map(d => d.productId)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(id => ({
              label: formattedData.find(d => d.productId === id)?.productName || "",
              value: id || "",
            }))]
        },
      ]}
      exportConfig={{
        fileName: `Orders`,
        sheetName: "Orders",
      }}
    />
  );
};

export default OrdersClient;

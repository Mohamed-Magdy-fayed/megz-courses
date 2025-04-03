import { columns } from "./OrdersOverviewColumns";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { useEffect } from "react";

const LatestOrdersClient = () => {
  const { data, refetch, isLoading } = api.orders.getLatest.useQuery(undefined, { enabled: false })

  const formattedData = data?.orders.map((order) => ({
    orderId: order.id,
    userId: order.user.id,
    orderNumber: order.orderNumber,
    userName: order.user.name,
    createdAt: order.createdAt,
    status: order.status,
  })) || [];

  useEffect(() => { refetch() }, [])

  return (
    <DataTable
      isLoading={isLoading}
      isSuperSimple
      columns={columns}
      data={formattedData}
      setData={() => { }}
      onDelete={() => { }}
      searches={[
        {
          key: "orderNumber",
          label: "Order Number"
        },
        {
          key: "userName",
          label: "Name"
        },
      ]}
      dateRanges={[
        {
          key: "createdAt",
          label: "Date"
        }
      ]}
      filters={[
        {
          filterName: "Status",
          key: "status",
          values: formattedData.map(d => d.status)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(status => ({
              label: status,
              value: status,
            }))
        }
      ]}
    />
  );
};

export default LatestOrdersClient;

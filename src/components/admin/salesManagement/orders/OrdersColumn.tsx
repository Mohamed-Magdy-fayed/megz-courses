import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { validOrderStatusesColors } from "@/lib/enumColors";
import { filterFn } from "@/lib/dataTableUtils";
import UserAvatar from "@/components/ui/user/UserAvatar";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { Checkbox } from "@/components/ui/checkbox";
import OrderActions from "@/components/admin/salesManagement/orders/OrderActions";
import OrderPayments from "@/components/admin/salesManagement/orders/OrderPayments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import OrderRefunds from "@/components/admin/salesManagement/orders/OrderRefunds";

export type OrderColumns = {
  isStudentView: boolean;
  id: string;
  amount: number;
  paidAmount: number;
  refundedAmount: number;
  remainingAmount: number;
  paidAt?: Date;
  orderNumber: string;
  leadCode: string;
  status: OrderStatus;
  userId: string;
  userName: string;
  userImage: string;
  refundRequester: string | null;
  productId: string;
  productName: string;
}

export const orderColumns: ColumnDef<OrderColumns>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "orderNumber", cell: ({ row }) => <Link className="in-table-link" href={`/admin/sales_management/orders/${row.original.orderNumber}`}>{row.original.orderNumber}</Link> },
  { accessorKey: "userName", cell: ({ row }) => !row.original.isStudentView && <Link className="in-table-link flex items-center gap-2" href={`/admin/users_management/account/${row.original.userId}`}><UserAvatar src={row.original.userImage} />{row.original.userName}</Link> },
  { accessorKey: "amount", cell: ({ row }) => formatPrice(row.original.amount) },
  {
    accessorKey: "status", cell: ({ row }) => {
      return (
        <WrapWithTooltip text={row.original.status === "Refunded" ? `Refunded By: ${row.original.refundRequester ? row.original.refundRequester : "NA"}` : ""}>
          <SeverityPill color={validOrderStatusesColors(row.original.status)}>
            {row.original.status}
          </SeverityPill>
        </WrapWithTooltip>
      )
    },
  },
  {
    accessorKey: "paidAmount", header: "Transactions", cell: ({ row }) =>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="p-0 px-2 h-fit w-full" customeColor={"infoIcon"}>View <EyeIcon size={20} className="ml-1" /></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remaining amount: {row.original.remainingAmount}</DialogTitle>
          </DialogHeader>
          <Tabs id={`order${row.original.id}trx`} defaultValue="payments">
            <TabsList className="w-full">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="refunds">Refunds</TabsTrigger>
            </TabsList>
            <TabsContent value="payments">
              <OrderPayments orderId={row.original.id} />
            </TabsContent>
            <TabsContent value="refunds">
              <OrderRefunds orderId={row.original.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
  },
  { accessorKey: "paidAt", cell: ({ row }) => !row.original.paidAt ? "NA" : format(row.original.paidAt, "PP"), filterFn },
  { accessorKey: "productId", cell: ({ row }) => !row.original.isStudentView && <Link className="in-table-link" href={`/admin/system_management/products/${row.original.productId}`}>{row.original.productName}</Link> },
  { accessorKey: "leadCode", cell: ({ row }) => !row.original.isStudentView && <Link className="in-table-link" href={`/admin/sales_management/leads/${row.original.leadCode}`}>{row.original.leadCode}</Link> },
  { id: "action", header: "Actions", cell: ({ row }) => !row.original.isStudentView && <OrderActions data={row.original} /> },
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Coins, Copy, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { OrderRow } from "./OrdersColumn";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/ui/modal";
import { RefundModal } from "@/components/modals/RefundModal";

interface CellActionProps {
  data: OrderRow;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const trpcUtils = api.useUtils()
  const deleteMutation = api.orders.deleteOrders.useMutation()
  const { toastSuccess, toastError } = useToast();

  const onCopy = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    toastSuccess("Order number copied to the clipboard")
  };

  const onDelete = (callback?: () => void) => {
    setLoading(true)
    deleteMutation.mutate(
      [data.id],
      {
        onSuccess: (data) => {
          trpcUtils.orders.invalidate()
            .then(() => {
              callback?.()
              toastSuccess(`Deleted ${data.deletedOrders.count} order(s)`)
              setLoading(false)
              setOpen(false)
            })
        },
        onError: (error) => {
          toastError(error.message)
          setLoading(false)
        },
      }
    )
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete"
        description="This action can't be undone!"
        children={
          <div className="flex w-full items-center justify-end space-x-2 pt-6 py-2">
            <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
              Continue
            </Button>
          </div>
        }
      />
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        orderId={data.id}
      />
      <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" customeColor={"mutedOutlined"} className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.orderNumber)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Order Number
          </DropdownMenuItem>
          <DropdownMenuItem disabled={data.status === "Refunded"} onClick={() => {
            setIsRefundModalOpen(true)
            setIsOpen(false)
          }}>
            <Coins className="w-4 h-4 mr-2" />
            Refund
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setOpen(true)
            setIsOpen(false)
          }}>
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;

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
import SelectField from "../salesOperation/SelectField";
import Modal from "@/components/ui/modal";

interface CellActionProps {
  data: OrderRow;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [refundReason, setRefundReason] = useState<("requested_by_customer" | "duplicate" | "fraudulent")[]>([])
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const trpcUtils = api.useContext()
  const refundOrderMutation = api.orders.refundOrder.useMutation({
    onMutate: () => setLoading(true),
    onSuccess: ({ success }) => {
      toast({ variant: "info", description: success ? "refunded successfully" : "Unable to refund" })
      setIsRefundModalOpen(false)
    },
    onError: ({ message }) => toastError(message.startsWith("No such payment_intent") ? "Please refund the order manually!" : message),
    onSettled: () => setLoading(false),
  })
  const deleteMutation = api.orders.deleteOrders.useMutation()
  const { toastInfo, toastSuccess, toastError, toast } = useToast();

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

  const handleRefund = () => {
    if (!refundReason[0]) return toastError("please select a reason")
    refundOrderMutation.mutate({
      orderId: data.id,
      reason: refundReason[0],
    })
  }

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete"
        description="This action can't be undone!"
        children={
          <div className="flex w-full items-center justify-end space-x-2 pt-6">
            <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
              Continue
            </Button>
          </div>
        }
      />
      <Modal
        title="Refund"
        description="Select refund reason"
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        children={(
          <div className="flex gap-4 items-center justify-between">
            <SelectField
              disabled={loading}
              data={[
                { active: true, label: "Customer request", value: "requested_by_customer" },
                { active: true, label: "Dublicate", value: "duplicate" },
                { active: true, label: "Fraud", value: "fraudulent" },
              ]}
              listTitle="Reasons"
              placeholder="Select Refund Reason"
              values={refundReason}
              setValues={setRefundReason}
              disableSearch
            />
            <div className="flex items-center gap-4">
              <Button
                disabled={loading}
                onClick={() => setIsRefundModalOpen(false)}
                variant={"outline"}
                customeColor={"destructiveOutlined"}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                onClick={handleRefund}
                customeColor={"success"}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
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
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
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

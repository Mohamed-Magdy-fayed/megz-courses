import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { OrderRow } from "./OrdersColumn";
import { useToast } from "@/components/ui/use-toast";
import { AlertModal } from "../modals/AlertModal";

interface CellActionProps {
  data: OrderRow;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const trpcUtils = api.useContext()
  const deleteMutation = api.orders.deleteOrders.useMutation()
  const { toast } = useToast()

  const onCopy = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    toast({
      variant: "success",
      description: "Order number copied to the clipboard"
    })
  };

  const onDelete = () => {
    setLoading(true)
    deleteMutation.mutate(
      [data.id],
      {
        onSuccess: (data) => {
          toast({
            variant: "success",
            description: `Deleted ${data.deletedOrders.count} order(s)`
          })
          trpcUtils.orders.invalidate()
            .then(() => {
              setLoading(false)
              setOpen(false)
            })
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            description: e.message
          })
          setLoading(false)
        },
      }
    )
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
      />
      <DropdownMenu>
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
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;

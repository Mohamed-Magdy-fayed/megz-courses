import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, MoreVertical } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { AssignModal } from "../modals/AssignModal";
import { OrderRow } from "./OrdersColumn";
import { useToast } from "@/components/ui/use-toast";

interface CellActionProps {
  data: OrderRow;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const assignMutation = api.salesOperations.createSalesOperation.useMutation()
  const { toast } = useToast()

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      variant: "success",
      description: "Category ID copied to the clipboard"
    })
  };

  const onAssign = (assigneeId: string) => {
    setLoading(true)
    setOpen(false)
    assignMutation.mutate(
      { assigneeId, status: "assigned" },
      {
        onSuccess: (data) => {
          toast({
            variant: "success",
            description: `Operation ID: ${data.salesOperations.code}`
          })
          setLoading(false)
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            description: "Something went wrong."
          })
          setLoading(false)
        },
      }
    )
  };

  return (
    <>
      <AssignModal
        isOpen={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={onAssign}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" customeColor={"mutedOutlined"} className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Assign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;

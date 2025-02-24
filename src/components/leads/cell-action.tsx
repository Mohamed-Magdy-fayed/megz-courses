import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, ChevronDownIcon, PackagePlus, Trash, View } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { AssignModal } from "../modals/AssignModal";
import { Lead } from "./LeadsColumn";
import { toastType, useToast } from "@/components/ui/use-toast";
import { AlertModal } from "@/components/modals/AlertModal";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Workflow } from "lucide-react";
import { hasPermission } from "@/server/permissions";
import CreateOrderModal from "@/components/modals/CreateOrderModal";

interface CellActionProps {
  data: Lead;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const router = useRouter()

  const [loadingToast, setLoadingToast] = useState<toastType>();
  const { toast, toastSuccess, toastError } = useToast()
  const trpcUtils = api.useUtils()

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toastSuccess("User ID copied to the clipboard")
  };

  const assignMutation = api.leads.assignLead.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      successMessageFormatter: ({ lead }) => {
        setOpen(false)
        return `Lead Assigned to: ${lead.assignee?.user.name}`
      },
    })
  )
  const moveLeadMutation = api.leads.moveLeads.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      successMessageFormatter: ({ updatedLeads }) => `Lead moved`
    })
  )
  const deleteMutation = api.leads.deleteLead.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      loadingMessage: "Deleting...",
      successMessageFormatter: ({ deletedLeads }) => {
        setIsDeleteOpen(false)
        return `Deleted ${deletedLeads.count} successfully!`
      }
    })
  )

  const session = useSession()
  const isOperationAssigned = useMemo(() => !!data.assignee, [data.assignee])
  const isOperationManger = useMemo(() => session.data?.user && hasPermission(session.data?.user, "leads", "update", data), [session.data?.user])
  const operationAssignedForCurrentUser = useMemo(() => session.data?.user.id === data.assignee?.userId, [session.data?.user.id, data.assignee?.userId])

  const onAssign = (agentId: string) => {
    assignMutation.mutate({ agentId, leadId: data.id })
  };

  const handleAssignToMe = () => {
    if (!session.data?.user.id) return toastError("Not authenticated")
    assignMutation.mutate({ agentId: session.data?.user.id, leadId: data.id })
  }

  const handleDelete = () => {
    deleteMutation.mutate([data.id])
  }

  const handleMoveLead = (toStageId: string) => {
    moveLeadMutation.mutate({
      leadIds: [data.id],
      toStageId,
    })
  }

  return (
    <>
      <AssignModal
        isOpen={open}
        loading={!!loadingToast}
        onClose={() => setOpen(false)}
        onConfirm={onAssign}
      />
      <AlertModal
        isOpen={isDeleteOpen}
        loading={!!loadingToast}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        description="The lead data can not be restored after this action, are you sure?"
      />
      <CreateOrderModal email={data.email} leadId={data.id} isOpen={isCreateOrderOpen} setIsOpen={setIsCreateOrderOpen} />
      <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
        <DropdownMenuTrigger asChild>
          <Button customeColor={"mutedOutlined"} variant={"outline"} className="h-fit w-full p-0">
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/sales_management/leads/${data.id}`}>
              <View className="w-4 h-4 mr-2" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCopy(data.userId)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Id
          </DropdownMenuItem>
          {isOperationManger ? (
            <DropdownMenuItem onClick={() => {
              setIsOpen(false)
              setOpen(true)
            }}>
              <Workflow className="w-4 h-4 mr-2" />
              Assign
            </DropdownMenuItem>
          ) : !operationAssignedForCurrentUser && !isOperationAssigned && (
            <DropdownMenuItem onClick={handleAssignToMe}>
              <Workflow className="w-4 h-4 mr-2" />
              Assign to me
            </DropdownMenuItem>
          )}
          {!data.orderDetails?.orderNumber ? (
            <DropdownMenuItem disabled={data.stage?.defaultStage !== "Qualified"} onClick={() => (setIsOpen(false), setIsCreateOrderOpen(true))}>
              <PackagePlus className="w-4 h-4 mr-2" />
              Create Order
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={!data.orderDetails} asChild>
              <Link href={`/admin/sales_management/orders/${data.orderDetails?.orderNumber}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to order
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Move To</DropdownMenuLabel>
          {data.stages?.filter(s => s.name !== data.stageName).map(stage => (
            <DropdownMenuItem key={stage.id} onClick={() => handleMoveLead(stage.id)}>
              {stage.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => (setIsOpen(false), setIsDeleteOpen(true))}>
            <Trash className="w-4 h-4 mr-2 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu >
    </>
  );
};

export default CellAction;

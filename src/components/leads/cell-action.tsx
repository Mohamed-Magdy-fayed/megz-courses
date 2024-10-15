import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { AssignModal } from "../modals/AssignModal";
import { Lead } from "./LeadsColumn";
import { toastType, useToast } from "@/components/ui/use-toast";
import { AlertModal } from "@/components/modals/AlertModal";
import { createMutationOptions } from "@/lib/mutationsHelper";

interface CellActionProps {
  data: Lead;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [loadingToast, setLoadingToast] = useState<toastType>();
  const { toast } = useToast()
  const trpcUtils = api.useUtils()
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
  const moveLeadMutation = api.leads.moveLead.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      successMessageFormatter: ({ updatedLead }) => `Lead moved to stage ${updatedLead.leadStage?.name}`
    })
  )
  const deleteMutation = api.leads.deleteLead.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      loadingMessage: "Deleting...",
      successMessageFormatter: ({ deletedLeads }) => `Deleted ${deletedLeads.count} successfully!`
    })
  )
  const { toastError, toastSuccess } = useToast()

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toastSuccess("User ID copied to the clipboard")
  };

  const onAssign = (agentId: string) => {
    assignMutation.mutate({ agentId, leadId: data.id })
  };

  const handleDelete = () => {
    deleteMutation.mutate([data.id])
  }

  const handleMoveLead = (toStageId: string) => {
    moveLeadMutation.mutate({
      leadId: data.id,
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
      <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" customeColor={"mutedOutlined"} className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.userId)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => (setOpen(true), setIsOpen(false))}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Assign
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Move To</DropdownMenuLabel>
          {data.stages?.filter(s => s.name !== data.stageName).map(stage => (
            <DropdownMenuItem key={stage.id} onClick={() => handleMoveLead(stage.id)}>
              {stage.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => (setOpen(true), setIsDeleteOpen(true))}>
            <Trash className="w-4 h-4 mr-2 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;

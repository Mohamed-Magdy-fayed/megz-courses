import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { FileDown, FileUp } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import SalesOperationsClient from "@/components/salesOperations/SalesOperationsClient";
import { AssignModal } from "@/components/modals/AssignModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const SalesAgentsPage = () => {
  const [loading, setLoading] = useState(false);
  const [assignIsOpen, setAssingIsOpen] = useState(false);

  const { toastError, toastSuccess } = useToast()
  const trpcUtils = api.useUtils()
  const createOperationMutation = api.salesOperations.createSalesOperation.useMutation()
  const handleCreateOperation = (assigneeId: string) => {
    setLoading(true)
    createOperationMutation.mutate(
      { assigneeId, status: "assigned" },
      {
        onSuccess: (data) => {
          toastSuccess(`Operation ID: ${data.salesOperations.code}`)
        },
        onError: (error) => {
          toastError(error.message)
        },
        onSettled: () => {
          trpcUtils.salesOperations.invalidate()
          setAssingIsOpen(false)
          setLoading(false)
        }
      }
    )
  }

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Sales Operations</ConceptTitle>
            </div>
            <AssignModal
              isOpen={assignIsOpen}
              loading={loading}
              onClose={() => setAssingIsOpen(false)}
              onConfirm={handleCreateOperation}
            />
            <Button onClick={() => setAssingIsOpen(true)}>Create Operation</Button>
          </div>
          <PaperContainer>
            <SalesOperationsClient />
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default SalesAgentsPage;

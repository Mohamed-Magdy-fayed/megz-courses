import { TransparentButton } from "@/components/ui/Buttons";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { SvgIcon } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import SalesAgentsClient from "@/components/salesAgentComponents/SalesAgentsClient";
import SalesAgentForm from "@/components/salesAgentComponents/SalesAgentForm";
import SalesOperationsClient from "@/components/salesAgentComponents/SalesOperationsClient";
import { AssignModal } from "@/components/modals/AssignModal";
import { useToastStore } from "@/zustand/store";

const SalesAgentsPage = () => {
  const salesAgents = api.salesAgents.getSalesAgents.useQuery();
  const salesOperations = api.salesOperations.getAll.useQuery();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [assignIsOpen, setAssingIsOpen] = useState(false);

  const toast = useToastStore()
  const trpcUtils = api.useContext()
  const createOperationMutation = api.salesOperations.createSalesOperation.useMutation()
  const handleCreateOperation = (assigneeId: string) => {
    setLoading(true)
    createOperationMutation.mutate(
      { assigneeId, status: "assigned" },
      {
        onSuccess: (data) => {
          toast.success(`Operation ID: ${data.salesOperations.code}`)
        },
        onError: (error) => {
          toast.error(`an error occured ${error}`)
        },
        onSettled: () => {
          trpcUtils.invalidate()
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
              <ConceptTitle>Sales Agents</ConceptTitle>
              <div className="flex items-center gap-2">
                <TransparentButton>
                  <SvgIcon fontSize="small">
                    <FileDownloadOutlinedIcon />
                  </SvgIcon>
                  Import
                </TransparentButton>
                <TransparentButton>
                  <SvgIcon fontSize="small">
                    <FileUploadOutlinedIcon />
                  </SvgIcon>
                  Export
                </TransparentButton>
              </div>
            </div>
            <Button onClick={() => setIsOpen(true)}>
              <PlusIcon className="mr-2"></PlusIcon>
              Add
            </Button>
          </div>
          {isOpen && (
            <PaperContainer>
              <SalesAgentForm setIsOpen={setIsOpen}></SalesAgentForm>
            </PaperContainer>
          )}

          <PaperContainer>
            {salesAgents.isLoading ? (
              <Spinner></Spinner>
            ) : salesAgents.isError ? (
              <>Error</>
            ) : (
              <SalesAgentsClient data={salesAgents.data.salesAgents}></SalesAgentsClient>
            )}
          </PaperContainer>

          <ConceptTitle>Sales Tasks</ConceptTitle>
          <PaperContainer>
            {salesOperations.isLoading ? (
              <Spinner></Spinner>
            ) : salesOperations.isError ? (
              <>Error</>
            ) : (
              <SalesOperationsClient data={salesOperations.data.salesOperations}></SalesOperationsClient>
            )}
          </PaperContainer>
          <div>
            <AssignModal
              isOpen={assignIsOpen}
              loading={loading}
              onClose={() => setAssingIsOpen(false)}
              onConfirm={handleCreateOperation}
            />
            <Button onClick={() => setAssingIsOpen(true)}>Create Operation</Button>
          </div>

        </div>
      </main>
    </AppLayout>
  );
};

export default SalesAgentsPage;

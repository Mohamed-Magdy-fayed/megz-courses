import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { FileDown, FileUp, PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import SalesAgentsClient from "@/components/salesAgentComponents/SalesAgentsClient";
import SalesAgentForm from "@/components/salesAgentComponents/SalesAgentForm";
import SalesOperationsClient from "@/components/salesAgentComponents/SalesOperationsClient";
import { AssignModal } from "@/components/modals/AssignModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const SalesAgentsPage = () => {
  const salesAgents = api.salesAgents.getSalesAgents.useQuery();
  const salesOperations = api.salesOperations.getAll.useQuery();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [assignIsOpen, setAssingIsOpen] = useState(false);

  const { toast } = useToast()
  const trpcUtils = api.useContext()
  const createOperationMutation = api.salesOperations.createSalesOperation.useMutation()
  const handleCreateOperation = (assigneeId: string) => {
    setLoading(true)
    createOperationMutation.mutate(
      { assigneeId, status: "assigned" },
      {
        onSuccess: (data) => {
          toast({
            variant: "success",
            description: `Operation ID: ${data.salesOperations.code}`
          })
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            description: `an error occured ${error}`
          })
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={"icon"} customeColor={"infoIcon"}>
                      <FileDown />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography>Import</Typography>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={"icon"} customeColor={"infoIcon"}>
                      <FileUp />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography>Export</Typography>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
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

          <ConceptTitle className="mt-8">Sales Tasks</ConceptTitle>
          <PaperContainer>
            {salesOperations.isLoading ? (
              <Spinner></Spinner>
            ) : salesOperations.isError ? (
              <>Error</>
            ) : (
              <SalesOperationsClient
                data={salesOperations.data?.salesOperations.sort((a, b) => {
                  return a.createdAt > b.createdAt ? -1 : 1
                })}
              />
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

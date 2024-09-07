import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import SalesAgentsClient from "@/components/salesAgentComponents/SalesAgentsClient";
import SalesAgentForm from "@/components/salesAgentComponents/SalesAgentForm";
import Modal from "@/components/ui/modal";

const SalesAgentsPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Operational Team</ConceptTitle>
            </div>
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
          </div>
          <Modal
            title="Operatoins Team"
            description="Create a new user for operations team"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={(
              <SalesAgentForm setIsOpen={setIsOpen}></SalesAgentForm>
            )}
          />
          <PaperContainer>
            <SalesAgentsClient />
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default SalesAgentsPage;

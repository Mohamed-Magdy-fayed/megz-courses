import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import Modal from "@/components/ui/modal";
import SalesAgentForm from "@/components/admin/usersManagement/salesAgentComponents/SalesAgentForm";
import SalesAgentClient from "@/components/admin/usersManagement/salesAgentComponents/SalesAgentsClient";

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
          <SalesAgentClient />
        </div>
      </main>
    </AppLayout>
  );
};

export default SalesAgentsPage;

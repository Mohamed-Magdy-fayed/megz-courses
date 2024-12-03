import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import ChatAgentForm from "@/components/chatAgentsComponents/ChatAgentForm";
import ChatAgentsClient from "@/components/chatAgentsComponents/ChatAgentsClient";
import Modal from "@/components/ui/modal";

const ChatAgentsPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Chat Agents</ConceptTitle>
            </div>
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
          </div>
          <Modal
            title="Chat Agent"
            description="create chat agent user"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={(
              <ChatAgentForm setIsOpen={setIsOpen}></ChatAgentForm>
            )}
          />
          <PaperContainer>
            <ChatAgentsClient />
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default ChatAgentsPage;

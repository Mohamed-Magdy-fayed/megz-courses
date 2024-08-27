import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { useState } from "react";
import { FileDown, FileUp, PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ChatAgentForm from "@/components/chatAgentsComponents/ChatAgentForm";
import ChatAgentsClient from "@/components/chatAgentsComponents/ChatAgentsClient";

const ChatAgentsPage = () => {
  const chatAgents = api.chatAgents.getChatAgents.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <main className="flex">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Chat Agents</ConceptTitle>
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
            <ChatAgentForm setIsOpen={setIsOpen}></ChatAgentForm>
          )}

          <PaperContainer>
            {chatAgents.isLoading ? (
              <Spinner></Spinner>
            ) : chatAgents.isError ? (
              <>Error</>
            ) : (
              <ChatAgentsClient data={chatAgents.data.chatAgents}></ChatAgentsClient>
            )}
          </PaperContainer>
        </div>
      </main>
    </AppLayout>
  );
};

export default ChatAgentsPage;

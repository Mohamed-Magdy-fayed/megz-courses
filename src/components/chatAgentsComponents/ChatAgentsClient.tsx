import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { ChatAgentColumn, columns } from "./ChatAgentColumn";
import { ChatAgent, SupportChat, User } from "@prisma/client";
import { useToast } from "../ui/use-toast";

interface ChatAgents extends ChatAgent {
  user: User;
  chats: SupportChat[];
}

const ChatAgentsClient = ({ data }: { data: ChatAgents[] }) => {
  const [chatAgents, setChatAgents] = useState<ChatAgentColumn[]>([]);
  const formattedData = data.map((agent) => ({
    id: agent.user.id,
    name: agent.user.name || "no name",
    image: agent.user.image || "",
    email: agent.user.email || "no email",
    chats: agent?.chats.length || 0,
    createdAt: format(agent.user.createdAt, "MMMM do, yyyy"),
  }));

  const { toastError, toastSuccess } = useToast();
  const deleteMutation = api.users.deleteUser.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = () => {
    deleteMutation.mutate(
      chatAgents.map((chatAgent) => chatAgent.id),
      {
        onSuccess: () => {
          toastSuccess("Agent(s) deleted");
          trpcUtils.chatAgents.invalidate();
        },
        onError: (error) => {
          toastError(error.message);
        },
      }
    );
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={setChatAgents}
      onDelete={onDelete}
    />
  );
};

export default ChatAgentsClient;

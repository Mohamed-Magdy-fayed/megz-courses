import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { ChatAgentColumn, columns } from "./ChatAgentColumn";
import { useToast } from "../ui/use-toast";

const ChatAgentsClient = () => {
  const [chatAgents, setChatAgents] = useState<ChatAgentColumn[]>([]);

  const { toastError, toastSuccess } = useToast();
  const trpcUtils = api.useContext();
  const { data, isLoading } = api.chatAgents.getChatAgents.useQuery();
  const deleteMutation = api.users.deleteUser.useMutation();

  const formattedData = data?.chatAgents.map((agent) => ({
    id: agent.user.id,
    name: agent.user.name || "no name",
    image: agent.user.image || "",
    email: agent.user.email || "no email",
    chats: agent?.chats.length || 0,
    createdAt: format(agent.user.createdAt, "MMMM do, yyyy"),
  }));

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      chatAgents.map((chatAgent) => chatAgent.id),
      {
        onSuccess: () => {
          trpcUtils.chatAgents.invalidate()
            .then(() => {
              callback?.()
              toastSuccess("Agent(s) deleted");
            })
        },
        onError: (error) => {
          toastError(error.message);
        },
      }
    );
  };

  return (
    <DataTable
      skele={isLoading}
      columns={columns}
      data={formattedData || []}
      setData={setChatAgents}
      onDelete={onDelete}
      dateRanges={[{ key: "createdAt", label: "Created At" }]}
      searches={[
        { key: "email", label: "Email" },
        { key: "chats", label: "Chats" },
      ]}
    />
  );
};

export default ChatAgentsClient;

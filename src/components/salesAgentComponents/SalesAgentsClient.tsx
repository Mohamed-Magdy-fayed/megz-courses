import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgentsColumn, columns } from "./SalesAgentColumn";
import { SalesAgent, SalesOperation, User } from "@prisma/client";
import { useToast } from "../ui/use-toast";

interface SalesAgents extends SalesAgent {
  user: User;
  tasks: SalesOperation[];
}

const SalesAgentClient = ({ data }: { data: SalesAgents[] }) => {
  const [salesAgents, setSalesAgents] = useState<SalesAgentsColumn[]>([]);
  const formattedData = data.map((agent) => ({
    id: agent.user.id,
    name: agent.user.name || "no name",
    email: agent.user.email || "no email",
    image: agent.user.image || "no image",
    phone: agent.user.phone || "no phone",
    tasks: agent?.tasks.length || 0,
    salary: agent?.salary || "no salary",
    createdAt: format(agent.user.createdAt, "MMMM do, yyyy"),
  }));

  const { toastError, toastSuccess } = useToast();
  const deleteMutation = api.users.deleteUser.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      salesAgents.map((salesAgent) => salesAgent.id),
      {
        onSuccess: () => {
          trpcUtils.salesAgents.invalidate()
            .then(() => {
              toastSuccess("Agent(s) deleted");
              callback?.()
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
      columns={columns}
      data={formattedData}
      setData={setSalesAgents}
      onDelete={onDelete}
    />
  );
};

export default SalesAgentClient;

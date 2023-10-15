import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgentsColumn, columns } from "./SalesAgentColumn";
import { SalesAgent, SalesOperation, User } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { Typography } from "../ui/Typoghraphy";

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

  const { toast } = useToast();
  const deleteMutation = api.users.deleteUser.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = () => {
    deleteMutation.mutate(
      salesAgents.map((salesAgent) => salesAgent.id),
      {
        onSuccess: () => {
          toast({
            variant: "success",
            description: "Agent(s) deleted"
          });
          trpcUtils.salesAgents.invalidate();
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            description: (
              <div>
                <Typography>somthing went wrong</Typography>
                <Typography>{e.message}</Typography>
              </div>
            ),
          });
        },
      }
    );
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={setSalesAgents}
      onDelete={onDelete}
    />
  );
};

export default SalesAgentClient;

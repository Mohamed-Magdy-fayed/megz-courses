import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgentsColumn, columns } from "./SalesAgentColumn";
import { SalesAgent, SalesOperation, User } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { Typography } from "../ui/Typoghraphy";

interface Users extends User {
  salesAgent: (SalesAgent & {
    tasks: SalesOperation[];
  }) | null;

}

const SalesAgentClient = ({ data }: { data: Users[] }) => {
  const [salesAgents, setSalesAgents] = useState<SalesAgentsColumn[]>([]);
  const formattedData = data.map((user) => ({
    id: user.id,
    name: user.name || "no name",
    email: user.email || "no email",
    image: user.image || "no image",
    phone: user.phone || "no phone",
    tasks: user.salesAgent?.tasks.length || 0,
    salary: user.salesAgent?.salary || "no salary",
    createdAt: format(user.createdAt, "MMMM do, yyyy"),
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

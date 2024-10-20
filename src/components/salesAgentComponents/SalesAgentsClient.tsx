import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgentsColumn, columns } from "./SalesAgentColumn";
import { useToast } from "../ui/use-toast";

const SalesAgentClient = () => {
  const [salesAgents, setSalesAgents] = useState<SalesAgentsColumn[]>([]);

  const { toastError, toastSuccess } = useToast();
  const trpcUtils = api.useUtils();
  const { data, isLoading } = api.salesAgents.getSalesAgents.useQuery();
  const deleteMutation = api.users.deleteUser.useMutation();

  const formattedData = data?.salesAgents.map((agent) => ({
    id: agent.user.id,
    name: agent.user.name || "no name",
    email: agent.user.email || "no email",
    image: agent.user.image || "no image",
    phone: agent.user.phone || "no phone",
    tasks: agent?.tasks.length || 0,
    salary: agent?.salary || "no salary",
    agent,
    createdAt: format(agent.user.createdAt, "MMMM do, yyyy"),
  })) || [];

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
      skele={isLoading}
      columns={columns}
      data={formattedData}
      setData={setSalesAgents}
      onDelete={onDelete}
      dateRanges={[{ key: "createdAt", label: "Created At" }]}
      searches={[
        { key: "email", label: "Email" },
        { key: "salary", label: "Salary" },
        { key: "phone", label: "Phone" },
        { key: "tasks", label: "Tasks" },
      ]}
    />
  );
};

export default SalesAgentClient;

import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgentsColumn, columns } from "./SalesAgentColumn";
import { toastType, useToast } from "../ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import useImportErrors from "@/hooks/useImportErrors";
import { Input } from "@/components/ui/input";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typoghraphy";

const SalesAgentClient = () => {
  const [salesAgents, setSalesAgents] = useState<SalesAgentsColumn[]>([]);
  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [password, setPassword] = useState("");

  const { ErrorsModal, setError } = useImportErrors()

  const { toastError, toastSuccess, toast } = useToast();
  const trpcUtils = api.useUtils();
  const { data, isLoading } = api.salesAgents.getSalesAgents.useQuery();
  const deleteMutation = api.users.deleteUser.useMutation();
  const importMutation = api.users.importUsers.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: ({ errors, users }) => {
        if (errors.length > 0) {
          setError({
            isError: true,
            lines: errors.map(e => ({
              lineNumber: e.lineNumber,
              lineData: { name: e.name, email: e.email, phone: e.phone },
              lineError: e.exists ? "Email Taken" : "Unkowen Error"
            }))
          })
        }
        if (users.length === 0) "No users imported!"
        return `${users.length} Users Imported!`
      },
      toast,
      trpcUtils,
      loadingMessage: "Importing..."
    })
  );

  const formattedData = data?.salesAgents.map((agent) => ({
    id: agent.user.id,
    name: agent.user.name || "no name",
    email: agent.user.email || "no email",
    image: agent.user.image || "no image",
    phone: agent.user.phone || "no phone",
    tasks: agent?.leads.length || 0,
    agent,
    agentType: agent.user.userRoles,
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
    <>
      {ErrorsModal}
      <DataTable
        skele={isLoading}
        columns={columns}
        data={formattedData}
        setData={setSalesAgents}
        onDelete={onDelete}
        dateRanges={[{ key: "createdAt", label: "Created At" }]}
        searches={[
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "tasks", label: "Tasks" },
        ]}
        exportConfig={{
          fileName: `Sales Agents`,
          sheetName: "Sales Agents",
        }}
        importConfig={{
          reqiredFields: ["name", "email", "phone"],
          sheetName: "Sales Agents",
          templateName: "Import Sales Agents Data",
          extraDetails: (
            <>
              <Input
                placeholder="Password for the added users"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="w-full flex flex-col items-start gap-2">
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", password.length > 5 && "text-success")} /><Typography>Six Characters</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[a-z]/.test(password) && "text-success")} /><Typography>Lowercase letter</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[A-Z]/.test(password) && "text-success")} /><Typography>Uppercase letter</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[0-9]/.test(password) && "text-success")} /><Typography>Number</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[!@#$%^&*(),.?":{ }|<>]/.test(password) && "text-success")} /><Typography>Special Character</Typography></div>}
              </div>
            </>
          ),
        }}
        handleImport={(data) => {
          console.log(data);

          if (
            password.length > 5
            && /[a-z]/.test(password)
            && /[A-Z]/.test(password)
            && /[0-9]/.test(password)
            && /[!@#$ %^&* (),.? ":{ }|<>]/.test(password)
          ) {
            return importMutation.mutate({
              usersData: data.map(({ name, email, phone }) => ({
                name,
                email,
                phone,
              })),
              password,
              userRole: "SalesAgent",
            })
          }
          toastError("Password doesn't match criteria!")
        }}
      />
    </>
  );
};

export default SalesAgentClient;

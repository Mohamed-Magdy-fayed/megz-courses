import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/DataTable";
import { ChatAgentColumn, columns } from "./ChatAgentColumn";
import { toastType, useToast } from "../ui/use-toast";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMutationOptions } from "@/lib/mutationsHelper";
import useImportErrors from "@/hooks/useImportErrors";

const ChatAgentsClient = () => {
  const [chatAgents, setChatAgents] = useState<ChatAgentColumn[]>([]);
  const [password, setPassword] = useState("");
  const [loadingToast, setLoadingToast] = useState<toastType>();

  const { toastError, toastSuccess, toast } = useToast();
  const trpcUtils = api.useUtils();
  const { data, isLoading } = api.chatAgents.getChatAgents.useQuery();

  const formattedData = data?.chatAgents.map((agent) => ({
    id: agent.user.id,
    name: agent.user.name || "no name",
    image: agent.user.image || "",
    email: agent.user.email || "no email",
    phone: agent.user.phone || "no phone",
    chats: agent?.chats.length || 0,
    createdAt: format(agent.user.createdAt, "MMMM do, yyyy"),
  }));

  const { ErrorsModal, setError } = useImportErrors()

  const deleteMutation = api.users.deleteUser.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: ({ deletedUsers }) => `${deletedUsers.count} Users Deleted!`,
      toast,
      trpcUtils,
      loadingMessage: "Deleting..."
    })
  );
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

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      chatAgents.map((ChatAgent) => ChatAgent.id),
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
    <>
      {ErrorsModal}
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
        exportConfig={{
          fileName: "Chat Agents",
          sheetName: "Chat Agents",
        }}
        importConfig={{
          reqiredFields: ["name", "email", "phone"],
          sheetName: "Chat Agents",
          templateName: "Import Chat Agents Data",
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
              userRole: "ChatAgent",
            })
          }
          toastError("Password doesn't match criteria!")
        }}
      />
    </>
  );
};

export default ChatAgentsClient;

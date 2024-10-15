import { columns, Lead } from "./LeadsColumn";
import { DataTable } from "../ui/DataTable";
import { FC, useState } from "react";
import { LeadStage, Prisma } from "@prisma/client";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { toastType, useToast } from "@/components/ui/use-toast";

type LeadsClientProps = {
  stage: Prisma.LeadStageGetPayload<{ include: { leads: { include: { assignee: { include: { user: true } } } } } }>;
  stagesData: LeadStage[];
  handleImport: (data: { name: string, email: string, phone: string }[]) => void;
}

const LeadsClient: FC<LeadsClientProps> = ({ stage, stagesData, handleImport }) => {
  const [data, setData] = useState<Lead[]>([])
  const [loadingToast, setLoadingToast] = useState<toastType>()

  const { toast } = useToast()
  const trpcUtils = api.useUtils()

  const formattedData = stage.leads.map(({
    userId,
    name,
    id,
    email,
    formId,
    message,
    phone,
    source,
    image,
    assignee,
  }) => ({
    id,
    name: name || "",
    email: email || "",
    formId: formId || "",
    message: message || "",
    phone: phone || "",
    source,
    stage,
    stages: stagesData,
    stageName: stage.name,
    assignee,
    assigneeName: assignee?.user.name || "Not Assigned",
    image: image || "",
    userId: userId || "",
  }))

  const deleteLeadsMutation = api.leads.deleteLead.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      loadingMessage: "Deleting...",
      successMessageFormatter: ({ deletedLeads }) => `${deletedLeads.count} Leads Deleted!`,
    })
  )

  const onDelete = (callback?: () => void) => {
    deleteLeadsMutation.mutate(data.map(item => item.id), { onSuccess: () => { callback?.() } })
  }


  return (
    <DataTable
      columns={columns}
      data={formattedData || []}
      setData={setData}
      onDelete={onDelete}
      handleImport={handleImport}
      importConfig={{
        reqiredFields: ["name", "email", "phone"],
        sheetName: "Leads Import",
        templateName: "Leads Import Template"
      }}
      exportConfig={{
        sheetName: `${stage.name} Stage`,
        fileName: `${stage.name} Stage Leads`
      }}
      searches={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      filters={[
        {
          key: "source", filterName: "Platform", values: [...formattedData?.map(d => ({
            label: d.source,
            value: d.source,
          })) || []]
        },
        {
          key: "stageName", filterName: "Stage", values: [...stagesData.map(s => ({
            label: s.name,
            value: s.name,
          })) || []]
        },
        {
          key: "assigneeName", filterName: "Agent", values: [...formattedData.map(d => d.assigneeName)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(name => ({
              label: name,
              value: name,
            })) || []]
        },
      ]}
    />
  );
};

export default LeadsClient;

import { columns, Lead } from "./LeadsColumn";
import { DataTable } from "../ui/DataTable";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { LeadStage, Prisma } from "@prisma/client";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { toastType, useToast } from "@/components/ui/use-toast";

type LeadsClientProps = {
  stage: Prisma.LeadStageGetPayload<{ include: { leads: { include: { salesOperations: true, labels: true, assignee: { include: { user: true } } } } } }>;
  stagesData: LeadStage[];
  resetSelection: boolean;
  handleImport: (data: { name: string, email: string, phone: string }[]) => void;
  setSelectedLeads: Dispatch<SetStateAction<Lead[]>>;
}

const LeadsClient: FC<LeadsClientProps> = ({ resetSelection, stage, stagesData, handleImport, setSelectedLeads }) => {
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
    labels,
    isReminderSet,
    reminders,
    salesOperations,
    createdAt,
    updatedAt,
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
    labels,
    isReminderSet,
    reminders,
    salesOperations,
    assigneeName: assignee?.user.name || "Not Assigned",
    image: image || "",
    userId: userId || "",
    createdAt,
    updatedAt,
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
      setData={(data) => {
        setData(data)
        setSelectedLeads(data)
      }}
      resetSelection={resetSelection}
      onDelete={onDelete}
      handleImport={(data) => {
        handleImport(data.map(({ name, email, phone }) => ({
          name,
          email: email || "",
          phone: phone || "",
        })))
      }}
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
      dateRanges={[{ key: "createdAt", label: "Created At" }]}
    />
  );
};

export default LeadsClient;

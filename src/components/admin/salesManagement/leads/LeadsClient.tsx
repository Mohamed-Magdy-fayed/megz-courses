import { columns, LeadColumn } from "./LeadsColumn";
import { DataTable } from "@/components/ui/DataTable";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { LeadStage, Prisma } from "@prisma/client";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { toastType, useToast } from "@/components/ui/use-toast";
import { exportToExcel } from "@/lib/exceljs";

type LeadsClientProps = {
  stageName: string;
  stagesData: { id: string, name: string }[];
  resetSelection: boolean;
  handleImport: (data: { name: string, email: string, phone: string }[]) => void;
  setSelectedLeads: Dispatch<SetStateAction<LeadColumn[]>>;
}

const LeadsClient: FC<LeadsClientProps> = ({ stageName, stagesData, resetSelection, handleImport, setSelectedLeads }) => {
  const [data, setData] = useState<LeadColumn[]>([])
  const [loadingToast, setLoadingToast] = useState<toastType>()

  const { toast } = useToast()
  const trpcUtils = api.useUtils()

  const { data: leads, isLoading } = api.leads.getLeads.useQuery({ name: stageName })

  const formattedData: LeadColumn[] = leads?.map(({
    userId,
    name,
    code,
    id,
    email,
    formId,
    message,
    phone,
    source,
    image,
    assignee,
    labels,
    reminders,
    isReminderSet,
    createdAt,
    updatedAt,
  }) => {
    const lastReminder = reminders[reminders.length - 1]?.time
    const isOverdue = (lastReminder && lastReminder < new Date() && isReminderSet)
    const dueToday = lastReminder && lastReminder.toDateString() === new Date().toDateString()

    return ({
      id,
      name: name || "",
      code: code || "",
      email: email || "",
      formId: formId || "",
      message: message || "",
      phone: phone || "",
      source,
      stageName,
      stagesData,
      assignee,
      labels,
      isOverdue: (!lastReminder || !isReminderSet) ? "Not set" : isOverdue ? "Overdue" : dueToday ? "Due today" : "Due later",
      assigneeName: assignee?.user.name || "Not Assigned",
      image: image || "",
      userId: userId || "",
      createdAt,
      updatedAt,
    })
  }) || []

  const [callback, setCallback] = useState<() => void>()
  const exportMutation = api.leads.exportLeads.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: (data) => {
        exportToExcel(data, `${stageName} Leads`, stageName)
        return `${data.length} Leads Exported!`
      },
      toast,
      trpcUtils,
      loadingMessage: "Exporting..."
    })
  );
  const deleteLeadsMutation = api.leads.deleteLead.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      loadingMessage: "Deleting...",
      successMessageFormatter: ({ deletedLeads }) => {
        callback?.()
        return `${deletedLeads.count} Leads Deleted!`
      },
    })
  )

  const onDelete = (callback?: () => void) => {
    setCallback(callback)
    deleteLeadsMutation.mutate(data.map(item => item.id))
  }

  return (
    <DataTable
      isLoading={isLoading}
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
      handleExport={(keys) => {
        exportMutation.mutate({
          select: keys,
          dateRanges: [],
          filters: [],
          searches: [],
        })
      }}
      importConfig={{
        reqiredFields: ["name", "email", "phone"],
        sheetName: "Leads Import",
        templateName: "Leads Import Template"
      }}
      exportConfig={{
        sheetName: `${stageName} Stage`,
        fileName: `${stageName} Stage Leads`,
      }}
      searches={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      filters={[
        {
          key: "source", filterName: "Source", values: [...formattedData?.map(d => d.source)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(name => ({
              label: name,
              value: name,
            })) || []
          ]
        },
        {
          key: "stageName", filterName: "Stage", values: [...formattedData.map(d => d.stageName)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(name => ({
              label: name,
              value: name,
            })) || []
          ]
        },
        {
          key: "assigneeName", filterName: "Agent", values: [...formattedData.map(d => d.assigneeName)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(name => ({
              label: name,
              value: name,
            })) || []]
        },
        {
          key: "isOverdue", filterName: "Reminder", values: [...formattedData.map(d => d.isOverdue)
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
import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { MessageTemplateRow, columns } from "./WhatsappTemplatesColumn";
import { useToast } from "@/components/ui/use-toast";

const WhatsappTemplatesClient = () => {
  const [data, setData] = useState<MessageTemplateRow[]>([]);

  const { toastError, toastSuccess } = useToast();
  const trpcUtils = api.useUtils();
  const { data: templatesData, isLoading } = api.whatsAppTemplates.getMessageTemplates.useQuery()

  const formattedData: MessageTemplateRow[] = templatesData?.messageTemplates.map(({ id, name, body, type, placeholders, updatedAt, createdAt }) => ({
    id,
    name,
    body,
    type,
    placeholders,
    updatedAt,
    createdAt,
  })) || [];


  const deleteMutation = api.whatsAppTemplates.deleteMessageTemplates.useMutation();

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      data.map(({ id }) => id),
      {
        onSuccess: () => {
          trpcUtils.whatsAppTemplates.invalidate()
            .then(() => {
              toastSuccess("whatsApp Template(s) deleted")
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
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={formattedData}
        setData={setData}
        onDelete={onDelete}
        dateRanges={[{ key: "createdAt", label: "Created On" }]}
        searches={[
          { key: "name", label: "Template Name" },
          { key: "body", label: "Template Body" },
          { key: "placeholders", label: "Placeholders" },
        ]}
        exportConfig={{
          fileName: `Message Templates`,
          sheetName: "Message Templates",
        }}
      />
    </>
  );
};

export default WhatsappTemplatesClient;

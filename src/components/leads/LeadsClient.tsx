import { columns } from "./LeadsColumn";
import { DataTable } from "../ui/DataTable";
import { api } from "@/lib/api";

const LeadsClient = () => {
  const { data, isLoading } = api.leads.getCustomers.useQuery();

  const formattedData = data?.potintialCustomers.map(({
    userId,
    name,
    id,
    email,
    formId,
    message,
    phone,
    platform,
    image,
  }) => ({
    id,
    name,
    email: email || "",
    formId: formId || "",
    message: message || "",
    phone: phone || "",
    platform,
    image: image || "",
    userId,
  }))

  return (
    <DataTable
      skele={isLoading}
      columns={columns}
      data={formattedData || []}
      setData={() => { }}
      onDelete={() => { }}
      searches={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      filters={[
        {
          key: "platform", filterName: "Platform", values: [...formattedData?.map(d => ({
            label: d.platform,
            value: d.platform,
          })) || []]
        }
      ]}
    />
  );
};

export default LeadsClient;

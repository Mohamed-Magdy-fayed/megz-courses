import { columns } from "./DatabaseColumn";
import { DataTable } from "../ui/DataTable";
import { api } from "@/lib/api";

const DatabaseClient = () => {
  const { data, isLoading } = api.potintialCustomers.getCustomers.useQuery();

  const formattedData = data?.potintialCustomers.map(({
    userId,
    name,
    id,
    email,
    formId,
    message,
    phone,
    platform,
    picture,
  }) => ({
    id,
    name,
    email: email || "",
    formId: formId || "",
    message: message || "",
    phone: phone || "",
    platform,
    picture: picture || "",
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

export default DatabaseClient;

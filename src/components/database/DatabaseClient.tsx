import { columns } from "./DatabaseColumn";
import { PotintialCustomer } from "@prisma/client";
import { DataTable } from "../ui/DataTable";

const DatabaseClient = ({ data }: { data: PotintialCustomer[] }) => {

  const formattedData = data.map(({
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
      columns={columns}
      data={formattedData}
      setData={() => { }}
      onDelete={() => { }}
      searches={[{ key: "name", label: "Name" }]}
    />
  );
};

export default DatabaseClient;

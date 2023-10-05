import { columns } from "./DatabaseColumn";
import { PotintialCustomer } from "@prisma/client";
import { DataTable } from "../ui/DataTable";

const DatabaseClient = ({ data }: { data: PotintialCustomer[] }) => {

  const formattedData = data.map(({
    facebookUserId,
    firstName,
    id,
    lastName,
    picture,
  }) => ({
    id,
    firstName,
    lastName,
    picture: picture || "",
    facebookUserId,
  }))

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={() => { }}
      onDelete={() => { }}
      search={{ key: "firstName", label: "Name" }}
    />
  );
};

export default DatabaseClient;

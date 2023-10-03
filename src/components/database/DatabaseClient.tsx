import { useState } from "react";
import { columns } from "./DatabaseColumn";
import { PotintialCustomer } from "@prisma/client";
import { DatabaseTable } from "./DatabaseTable";

const DatabaseClient = ({ data }: { data: PotintialCustomer[] }) => {
  const [customers, setCustomers] = useState<PotintialCustomer[]>([]);

  return (
    <DatabaseTable
      columns={columns}
      data={data}
      setCustomers={setCustomers}
    />
  );
};

export default DatabaseClient;

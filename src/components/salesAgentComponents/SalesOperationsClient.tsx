import { api } from "@/lib/api";
import { useState } from "react";
import { useToastStore } from "@/zustand/store";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgent, SalesOperation } from "@prisma/client";
import { SalesOperationColumn, columns } from "./SalesOperationColumn";
import { format } from "date-fns";

interface SalesOperations extends SalesOperation {
  assignee: SalesAgent | null;
}

const SalesOperationsClient = ({ data }: { data: SalesOperations[] }) => {
  const [salesOperations, setSalesOperations] = useState<SalesOperationColumn[]>([]);
  const formattedData = data.map((operation) => ({
    id: operation.id,
    assignee: operation.assignee?.userId || "",
    code: operation.code,
    status: operation.status,
    lastAction: format(operation.updatedAt, "MMMM do, yyyy"),
  }));

  const toast = useToastStore();
  const deleteMutation = api.salesOperations.deleteSalesOperations.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = () => {
    deleteMutation.mutate(
      salesOperations.map((salesOperation) => salesOperation.id),
      {
        onSuccess: () => {
          toast.info("User(s) deleted");
          trpcUtils.users.invalidate();
        },
        onError: () => {
          toast.error("somthing went wrong");
        },
      }
    );
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setUsers={setSalesOperations}
      onDelete={onDelete}
    />
  );
};

export default SalesOperationsClient;

import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SalesAgent, SalesOperation } from "@prisma/client";
import { SalesOperationColumn, columns } from "./SalesOperationColumn";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

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

  const deleteMutation = api.salesOperations.deleteSalesOperations.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast()

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      salesOperations.map((salesOperation) => salesOperation.id),
      {
        onSuccess: () => {
          trpcUtils.salesOperations.invalidate()
            .then(() => {
              toastSuccess("operation(s) deleted")
              callback?.()
            });
        },
        onError: (error) => {
          toastError(error.message)
        },
      }
    );
  };

  return (
    <DataTable
      columns={columns}
      data={formattedData}
      setData={setSalesOperations}
      onDelete={onDelete}
    />
  );
};

export default SalesOperationsClient;

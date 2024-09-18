import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SalesOperationColumn, columns } from "./SalesOperationColumn";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { validOperationStatus } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";

const SalesOperationsClient = () => {
  const [salesOperations, setSalesOperations] = useState<SalesOperationColumn[]>([]);

  const trpcUtils = api.useContext();
  const { data, isLoading } = api.salesOperations.getAll.useQuery();
  const deleteMutation = api.salesOperations.deleteSalesOperations.useMutation();
  const { toastError, toastSuccess } = useToast()

  const formattedData = data?.salesOperations.map((operation) => ({
    id: operation.id,
    assigneeId: operation.assignee?.user.id || "",
    assigneeName: operation.assignee?.user.name || "",
    assigneeImage: operation.assignee?.user.image || "",
    assigneeEmail: operation.assignee?.user.email || "",
    code: operation.code,
    status: operation.status,
    lastAction: format(operation.updatedAt, "P"),
  }));

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
      skele={isLoading}
      columns={columns}
      data={formattedData || []}
      setData={setSalesOperations}
      onDelete={onDelete}
      dateRanges={[{ key: "lastAction", label: "Last Action " }]}
      searches={[
        { key: "code", label: "Code" },
        { key: "assigneeEmail", label: "Assignee Email" },
      ]}
      filters={[{
        key: "status", filterName: "Status", values: [...validOperationStatus.map(status => ({
          label: upperFirst(status),
          value: status,
        }))]
      }]}
    />
  );
};

export default SalesOperationsClient;

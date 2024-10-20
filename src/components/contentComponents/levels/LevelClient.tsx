import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { LevelRow, columns } from "./LevelColumn";
import { useToast } from "@/components/ui/use-toast";

const LevelClient = ({ formattedData }: { formattedData: LevelRow[] }) => {
  const [users, setUsers] = useState<LevelRow[]>([]);

  const { toastError, toastSuccess } = useToast();

  const deleteMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useUtils();

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      users.map((user) => user.id),
      {
        onSuccess: () => {
          trpcUtils.users.invalidate()
            .then(() => {
              toastSuccess("User(s) deleted")
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
    <DataTable
      columns={columns}
      data={formattedData}
      setData={setUsers}
      onDelete={onDelete}
      searches={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
      ]}
      dateRanges={[{ key: "createdAt", label: "Created On" }]}
    />
  );
};

export default LevelClient;

import { api } from "@/lib/api";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { LevelRow, columns } from "./LevelColumn";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";

const LevelClient = ({ formattedData }: { formattedData: LevelRow[] }) => {
  const [users, setUsers] = useState<LevelRow[]>([]);
  const [loadingToast, setLoadingToast] = useState<toastType>()

  const { toastError, toastSuccess, toast } = useToast();

  const trpcUtils = api.useUtils();
  const deleteMutation = api.levels.deleteLevels.useMutation();
  const importMutation = api.levels.importLevels.useMutation(
    createMutationOptions({
      trpcUtils,
      loadingToast,
      setLoadingToast,
      toast,
      successMessageFormatter: ({ levels }) => {
        return `${levels.length} levels created`
      },
      loadingMessage: "Importing...",
    })
  )

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
      exportConfig={{
        fileName: `${formattedData[0]?.courseSlug} Course Levels`,
        sheetName: "Levels",
      }}
      importConfig={{
        reqiredFields: ["name", "slug"],
        sheetName: "Levels",
        templateName: "Levels Import Template",
      }}
      handleImport={(data) => {
        const courseSlug = formattedData[0]?.courseSlug
        if (!courseSlug) return toastError("No course slug")
        importMutation.mutate(data.map(lvl => ({
          courseSlug,
          name: lvl.name,
          slug: lvl.slug,
        })))
      }}
    />
  );
};

export default LevelClient;

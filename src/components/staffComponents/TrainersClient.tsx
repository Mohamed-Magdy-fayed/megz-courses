import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { TrainerColumn, columns } from "./StaffColumns";
import { useToast } from "../ui/use-toast";
import { validTrainerRoles } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";

const TrainersClient = () => {
  const [trainers, setTraiers] = useState<TrainerColumn[]>([]);

  const { toastError, toastSuccess } = useToast();

  const trpcUtils = api.useContext();
  const { data, isLoading } = api.trainers.getTrainers.useQuery();
  const deleteMutation = api.trainers.deleteTrainer.useMutation();

  const formattedData: TrainerColumn[] = data?.trainers.map((trainer) => ({
    id: trainer.id,
    userId: trainer.userId,
    name: trainer.user.name || "no name",
    email: trainer.user.email || "no email",
    image: trainer.user.image || "no image",
    phone: trainer.user.phone || "no phone",
    role: trainer.role || "NA",
    createdAt: format(trainer.createdAt, "MMMM do, yyyy"),
  })) || [];

  const onDelete = (callback?: () => void) => {
    deleteMutation.mutate(
      trainers.map(({ userId }) => userId),
      {
        onSuccess: () => {
          trpcUtils.trainers.invalidate()
            .then(() => {
              callback?.()
              toastSuccess("Trainer(s) deleted")
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
      data={formattedData}
      setData={setTraiers}
      onDelete={onDelete}
      dateRanges={[{ key: "createdAt", label: "Created At" }]}
      searches={[
        { key: "email", label: "Email" },
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
      ]}
      filters={[{
        key: "role",
        filterName: "Role",
        values: [...validTrainerRoles.map(role => ({
          label: upperFirst(role),
          value: role,
        }))]
      }]}
    />
  );
};

export default TrainersClient;

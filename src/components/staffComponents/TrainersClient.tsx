import { api } from "@/lib/api";
import { useState } from "react";
import { Trainer, User } from "@prisma/client";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { TrainerColumn, columns } from "./StaffColumns";
import { useToast } from "../ui/use-toast";
import { validTrainerRoles } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";

export interface Trainers extends Trainer {
  user: User;
}

const TrainersClient = ({ data }: { data: Trainers[] }) => {
  const [trainers, setTraiers] = useState<TrainerColumn[]>([]);
  const formattedData: TrainerColumn[] = data.map((trainer) => ({
    id: trainer.id,
    userId: trainer.userId,
    name: trainer.user.name || "no name",
    email: trainer.user.email || "no email",
    image: trainer.user.image || "no image",
    phone: trainer.user.phone || "no phone",
    role: trainer.role || "NA",
    createdAt: format(trainer.createdAt, "MMMM do, yyyy"),
  }));

  const { toastError, toastSuccess } = useToast();
  const deleteMutation = api.trainers.deleteTrainer.useMutation();
  const trpcUtils = api.useContext();

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
      columns={columns}
      data={formattedData}
      setData={setTraiers}
      onDelete={onDelete}
      searches={[
        { key: "email", label: "email" },
        { key: "name", label: "name" },
        { key: "phone", label: "phone" },
        { key: "createdAt", label: "createdAt" },
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

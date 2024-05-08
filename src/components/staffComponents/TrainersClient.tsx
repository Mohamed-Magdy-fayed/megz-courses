import { api } from "@/lib/api";
import { useState } from "react";
import { Trainer, User } from "@prisma/client";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { TrainerColumn, columns } from "./StaffColumns";
import { useToast } from "../ui/use-toast";

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

  const onDelete = () => {
    deleteMutation.mutate(
      trainers.map((user) => user.id),
      {
        onSuccess: () => {
          trpcUtils.trainers.invalidate().then(() => toastSuccess("Trainer(s) deleted"));
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
      setUsers={setTraiers}
      onDelete={onDelete}
      search={{
        key: "email",
        label: "Email"
      }}
    />
  );
};

export default TrainersClient;

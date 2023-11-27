import { api } from "@/lib/api";
import { useState } from "react";
import { Trainer, User } from "@prisma/client";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { TrainerColumn, columns } from "./StaffColumns";
import { useToast } from "../ui/use-toast";

export interface Users extends User {
  trainer: Trainer | null;
}

const StaffClient = ({ data }: { data: Users[] }) => {
  const [trainers, setTraiers] = useState<TrainerColumn[]>([]);
  const formattedData: TrainerColumn[] = data.map((user) => ({
    id: user.id,
    name: user.name || "no name",
    email: user.email || "no email",
    image: user.image || "no image",
    phone: user.phone || "no phone",
    role: user.trainer?.role || "NA",
    createdAt: format(user.createdAt, "MMMM do, yyyy"),
  }));

  const { toast } = useToast();
  const deleteMutation = api.trainers.deleteTrainer.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = () => {
    deleteMutation.mutate(
      trainers.map((user) => user.id),
      {
        onSuccess: () => {
          toast({
            description: "Trainer(s) deleted",
            variant: 'success'
          });
          trpcUtils.users.invalidate();
        },
        onError: () => {
          toast({
            description: "somthing went wrong",
            variant: "destructive"
          });
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
    />
  );
};

export default StaffClient;

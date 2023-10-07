import { api } from "@/lib/api";
import { useState } from "react";
import { Address, User } from "@prisma/client";
import { format } from "date-fns";
import { DataTable } from "../ui/DataTable";
import { Teacher, columns } from "./StaffColumns";
import { useToast } from "../ui/use-toast";

export interface Users extends User {
  address: Address | null;
}

const StaffClient = ({ data }: { data: Users[] }) => {
  const [users, setUsers] = useState<Teacher[]>([]);
  const formattedData = data.map((user) => ({
    id: user.id,
    name: user.name || "no name",
    email: user.email || "no email",
    image: user.image || "no image",
    phone: user.phone || "no phone",
    createdAt: format(user.createdAt, "MMMM do, yyyy"),
  }));

  const { toast } = useToast();
  const deleteMutation = api.users.deleteUser.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = () => {
    deleteMutation.mutate(
      users.map((user) => user.id),
      {
        onSuccess: () => {
          toast({
            description: "User(s) deleted",
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
      setUsers={setUsers}
      onDelete={onDelete}
    />
  );
};

export default StaffClient;

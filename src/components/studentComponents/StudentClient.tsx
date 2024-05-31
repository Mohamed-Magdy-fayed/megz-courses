import { api } from "@/lib/api";
import { useState } from "react";
import { getAddress } from "@/lib/utils";
import { User, Address } from "@prisma/client";
import { DataTable } from "@/components/ui/DataTable";
import { Student, columns } from "./StudentColumn";
import { useToast } from "../ui/use-toast";

interface Users extends User {
  address: Address | null;
}

const StudentClient = ({ data }: { data: Users[] }) => {
  const [users, setUsers] = useState<Student[]>([]);
  const formattedData = data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image || "no image",
    phone: user.phone || "no phone",
    address: user.address ? getAddress(user.address) : "no address",
    createdAt: user.createdAt,
  }));

  const { toastError, toastSuccess } = useToast();
  const deleteMutation = api.users.deleteUser.useMutation();
  const trpcUtils = api.useContext();

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
      search={{ key: "email", label: "Email" }}
    />
  );
};

export default StudentClient;

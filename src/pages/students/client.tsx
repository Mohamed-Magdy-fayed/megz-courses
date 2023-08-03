import { getAddress } from "@/lib/utils";
import { format } from "date-fns";
import React, { useState } from "react";
import { Student, columns } from "./components/columns";
import { User, Address } from "@prisma/client";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";

interface Users extends User {
  address: Address | null;
}

const Client = ({ data }: { data: Users[] }) => {
  const [users, setUsers] = useState<Student[]>([]);
  const formattedData = data.map((user) => ({
    id: user.id,
    name: user.name || "no name",
    email: user.email || "no email",
    image: user.image || "no image",
    phone: user.phone || "no phone",
    address: user.address ? getAddress(user.address) : "no address",
    createdAt: format(user.createdAt, "MMMM do, yyyy"),
  }));

  const toast = useToastStore();
  const deleteMutation = api.users.deleteUser.useMutation();
  const trpcUtils = api.useContext();

  const onDelete = () => {
    deleteMutation.mutate(
      users.map((user) => user.id),
      {
        onSuccess: () => {
          toast.info("User(s) deleted");
          trpcUtils.users.invalidate();
        },
        onError: () => {
          toast.error("somthing went wrong");
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

export default Client;

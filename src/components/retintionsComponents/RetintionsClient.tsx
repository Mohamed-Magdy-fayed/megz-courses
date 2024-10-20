import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getAddress } from "@/lib/utils";
import { DataTable } from "@/components/ui/DataTable";
import { RetintionsRow, columns } from "./RetintionsColumn";
import { useToast } from "../ui/use-toast";

const RetintionsClient = () => {
  const [users, setUsers] = useState<RetintionsRow[]>([]);

  const { data, isLoading, refetch: refetchUsers } = api.users.getRetintionsUsers.useQuery(undefined, { enabled: false });

  useEffect(() => {
    refetchUsers()
  }, [])

  const formattedData: RetintionsRow[] = data?.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image || "no image",
    phone: user.phone || "no phone",
    address: user.address ? getAddress(user.address) : "no address",
    userData: { user },
    latestCourse: user.courseStatus.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()).map(status => status.course.name)[0] || "No course!",
    latestLevel: user.courseStatus.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()).map(status => status.level?.name)[0] || "No level!",
    createdAt: user.createdAt,
  })) || [];

  const { toastError, toastSuccess } = useToast();

  const deleteMutation = api.users.deleteUser.useMutation();
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
      skele={isLoading}
      columns={columns}
      data={formattedData}
      setData={setUsers}
      onDelete={onDelete}
      filters={[
        {
          key: "latestCourse", filterName: "Latest Course", values: formattedData
            .map(d => d.latestCourse)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(val => ({
              label: val,
              value: val,
            }))
        },
        {
          key: "latestLevel", filterName: "Latest Level", values: formattedData
            .map(d => d.latestLevel)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(val => ({
              label: val,
              value: val,
            }))
        },
      ]}
      dateRanges={[{ key: "createdAt", label: "Created On" }]}
      searches={[
        { key: "email", label: "email" },
        { key: "address", label: "address" },
        { key: "phone", label: "phone" },
      ]}
    />
  );
};

export default RetintionsClient;

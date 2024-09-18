import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getAddress } from "@/lib/utils";
import { DataTable } from "@/components/ui/DataTable";
import { StudentRow, columns } from "./StudentColumn";
import { useToast } from "../ui/use-toast";

const StudentClient = () => {
  const [users, setUsers] = useState<StudentRow[]>([]);

  const { data: coursesData, refetch: refetchCourses } = api.courses.getAll.useQuery(undefined, { enabled: false })
  const { data, isLoading } = api.users.getUsers.useQuery({
    userType: "student",
  });

  useEffect(() => {
    refetchCourses()
  }, [])

  const formattedData: StudentRow[] = data?.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image || "no image",
    phone: user.phone || "no phone",
    address: user.address ? getAddress(user.address) : "no address",
    userData: { user },
    coursesData,
    createdAt: user.createdAt,
  })) || [];

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
      skele={isLoading}
      columns={columns}
      data={formattedData}
      setData={setUsers}
      onDelete={onDelete}
      dateRanges={[{ key: "createdAt", label: "Created On" }]}
      searches={[
        { key: "email", label: "email" },
        { key: "address", label: "address" },
        { key: "phone", label: "phone" },
      ]}
    />
  );
};

export default StudentClient;

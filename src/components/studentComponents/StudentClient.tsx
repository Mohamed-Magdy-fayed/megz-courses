import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { cn, getAddress } from "@/lib/utils";
import { DataTable } from "@/components/ui/DataTable";
import { StudentRow, columns } from "./StudentColumn";
import { toastType, useToast } from "../ui/use-toast";
import useImportErrors from "@/hooks/useImportErrors";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { CheckSquare } from "lucide-react";

const StudentClient = () => {
  const [users, setUsers] = useState<StudentRow[]>([]);
  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [password, setPassword] = useState("");

  const { ErrorsModal, setError } = useImportErrors()

  const { toastError, toastSuccess, toast } = useToast();
  const trpcUtils = api.useUtils();
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


  const deleteMutation = api.users.deleteUser.useMutation();
  const importMutation = api.users.importUsers.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: ({ errors, users }) => {
        if (errors.length > 0) {
          setError({
            isError: true,
            lines: errors.map(e => ({
              lineNumber: e.lineNumber,
              lineData: { name: e.name, email: e.email, phone: e.phone },
              lineError: e.exists ? "Email Taken" : "Unkowen Error"
            }))
          })
        }
        if (users.length === 0) "No users imported!"
        return `${users.length} Users Imported!`
      },
      toast,
      trpcUtils,
      loadingMessage: "Importing..."
    })
  );

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
    <>
      {ErrorsModal}
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
        exportConfig={{
          fileName: `Students`,
          sheetName: "Students",
        }}
        importConfig={{
          reqiredFields: ["name", "email", "phone"],
          sheetName: "Students",
          templateName: "Import Students Data",
          extraDetails: (
            <>
              <Input
                placeholder="Password for the added users"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="w-full flex flex-col items-start gap-2">
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", password.length > 5 && "text-success")} /><Typography>Six Characters</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[a-z]/.test(password) && "text-success")} /><Typography>Lowercase letter</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[A-Z]/.test(password) && "text-success")} /><Typography>Uppercase letter</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[0-9]/.test(password) && "text-success")} /><Typography>Number</Typography></div>}
                {<div className="flex items-center gap-4"><CheckSquare className={cn("w-4 h-4 text-destructive", /[!@#$%^&*(),.?":{ }|<>]/.test(password) && "text-success")} /><Typography>Special Character</Typography></div>}
              </div>
            </>
          ),
        }}
        handleImport={(data) => {
          console.log(data);

          if (
            password.length > 5
            && /[a-z]/.test(password)
            && /[A-Z]/.test(password)
            && /[0-9]/.test(password)
            && /[!@#$ %^&* (),.? ":{ }|<>]/.test(password)
          ) {
            return importMutation.mutate({
              usersData: data.map(({ name, email, phone }) => ({
                name,
                email,
                phone: phone || "",
              })),
              password,
              userType: "student",
            })
          }
          toastError("Password doesn't match criteria!")
        }}
      />
    </>
  );
};

export default StudentClient;

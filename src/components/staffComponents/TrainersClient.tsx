import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { TrainerColumn, columns } from "./StaffColumns";
import { validTrainerRoles } from "@/lib/enumsTypes";
import { upperFirst } from "lodash";
import { DataTable } from "@/components/ui/DataTable";
import { createMutationOptions } from "@/lib/mutationsHelper";
import useImportErrors from "@/hooks/useImportErrors";
import { Input } from "@/components/ui/input";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typoghraphy";
import { type toastType, useToast } from "@/components/ui/use-toast";
import SingleSelectField from "@/components/SingleSelectField";
import { TrainerRole } from "@prisma/client";

const TrainersClient = () => {
  const [trainers, setTraiers] = useState<TrainerColumn[]>([]);

  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<TrainerRole>();

  const { ErrorsModal, setError } = useImportErrors()

  const { toastError, toastSuccess, toast } = useToast();
  const trpcUtils = api.useUtils();
  const { data, isLoading } = api.trainers.getTrainers.useQuery();
  const deleteMutation = api.trainers.deleteTrainer.useMutation();
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
    <>
      {ErrorsModal}
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
        exportConfig={{
          fileName: `Trainers`,
          sheetName: "Trainers",
        }}
        importConfig={{
          reqiredFields: ["name", "email", "phone"],
          sheetName: "Trainers",
          templateName: "Import Trainers Data",
          extraDetails: (
            <div className="flex flex-col items-stretch gap-4 w-full">
              <SingleSelectField
                data={validTrainerRoles.map(r => ({ label: r, value: r }))}
                isLoading={!!loadingToast}
                title="Role"
                setSelected={setRole}
                selected={role}
              />
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
            </div>
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
              role,
              userType: "teacher",
            })
          }
          toastError("Password doesn't match criteria!")
        }}
      />
    </>
  );
};

export default TrainersClient;

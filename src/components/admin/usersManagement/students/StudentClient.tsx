import { api } from "@/lib/api";
import { useState } from "react";
import { cn, getAddress } from "@/lib/utils";
import useImportErrors from "@/hooks/useImportErrors";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { CheckSquare } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { studentColumns, StudentColumns } from "@/components/admin/usersManagement/students/StudentColumn";
import { ServerDataTable } from "@/components/ui/ServerDataTable";
import useServerDataTable from "@/hooks/useServerDataTable";
import { Devices } from "@prisma/client";
import { addFiltersCounts } from "@/lib/dataTableUtils";
import useDynamicSchema from "@/hooks/useDynamicSchema";
import { exportToExcel } from "@/lib/exceljs";
import { usePrefetchSurroundingPages } from "@/hooks/usePrefetchSurroundingPages";
import { DateRangeColumn, FilterColumn, SearchColumn } from "@/components/ui/ServerDataTable/utils/types";

const StudentClient = () => {
  const [users, setUsers] = useState<StudentColumns[]>([]);
  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [password, setPassword] = useState("");

  const { ErrorsModal, setError } = useImportErrors()

  const dateRanges: DateRangeColumn<StudentColumns>[] = [{ key: "createdAt", label: "Created On" }]
  const searches: SearchColumn<StudentColumns>[] = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
  ]
  const filters: FilterColumn<StudentColumns>[] = [
    {
      filterName: "Device", key: "device", values: [
        { label: "Desktop", value: Devices.Desktop, count: 0 },
        { label: "Tablet", value: Devices.Tablet, count: 0 },
        { label: "Mobile", value: Devices.Mobile, count: 0 },
        { label: "Null", value: "null", count: 0 },
      ]
    },
  ]

  const { toastError, toastSuccess, toast } = useToast();
  const trpcUtils = api.useUtils();

  const tableStates = useServerDataTable()
  const userSchema = useDynamicSchema(tableStates.columnFilters, dateRanges, searches, filters)

  const { data, isLoading } = api.users.getUsersTest.useQuery({
    pageIndex: tableStates.pagination.pageIndex,
    pageSize: tableStates.pagination.pageSize,
    sorting: tableStates.sorting as { id: keyof StudentColumns, desc: boolean }[],
    dateRanges: userSchema.dateRanges,
    filters: userSchema.filters,
    searches: userSchema.searches,
  });

  const formattedData: StudentColumns[] = data?.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    device: user.device,
    image: user.image || "no image",
    address: user.address ? getAddress(user.address) : "no address",
    createdAt: user.createdAt,
  })) || [];

  const exportMutation = api.users.exportUsers.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: (data) => {
        exportToExcel(data, "Students", "Students")
        return `${data.length} Users Exported!`
      },
      toast,
      trpcUtils,
      loadingMessage: "Exporting..."
    })
  );
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

  usePrefetchSurroundingPages({
    dataCount: data?.counts.filteredCount,
    pageIndex: tableStates.pagination.pageIndex,
    pageSize: tableStates.pagination.pageSize,
    prefetchFn: trpcUtils.users.getUsersTest.prefetch,
    dateRanges: userSchema.dateRanges,
    filters: userSchema.filters,
    searches: userSchema.searches,
    sorting: tableStates.sorting as { id: keyof StudentColumns; desc: boolean }[],
  });

  return (
    <>
      {ErrorsModal}
      <ServerDataTable
        {...tableStates}
        columns={studentColumns}
        data={formattedData}
        selectedData={users}
        handleExport={(keys) => {
          exportMutation.mutate({
            select: keys,
            dateRanges: userSchema.dateRanges,
            filters: userSchema.filters,
            searches: userSchema.searches,
          })
        }}
        filteredCount={data?.counts.filteredCount || 0}
        totalCount={data?.counts.totalCount || 0}
        isLoading={isLoading || !!loadingToast}
        setData={setUsers}
        onDelete={onDelete}
        dateRanges={dateRanges}
        searches={searches}
        filters={filters.map(f => addFiltersCounts(f.filterName, f.key, f.values, data?.counts.deviceCounts || {}))}
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
              userRole: "Student",
            })
          }
          toastError("Password doesn't match criteria!")
        }}
      />
    </>
  );
};

export default StudentClient;

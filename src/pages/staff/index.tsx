import { TransparentButton } from "@/components/ui/Buttons";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { Avatar, Box, Stack, SvgIcon, Typography } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useState } from "react";
import { ArrowUpDown, PlusIcon, X } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import { DialogHeader } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastStore } from "@/zustand/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { User, Address, Task } from "@prisma/client";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { getInitials } from "@/lib/getInitials";

const StaffPage = () => {
  const { data, isLoading, isError } = api.users.getUsers.useQuery({
    userType: "teacher",
  });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <Box component="main">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <ConceptTitle>Teachers</ConceptTitle>
              <Stack alignItems="center" direction="row" spacing={1}>
                <TransparentButton>
                  <SvgIcon fontSize="small">
                    <FileDownloadOutlinedIcon />
                  </SvgIcon>
                  Import
                </TransparentButton>
                <TransparentButton>
                  <SvgIcon fontSize="small">
                    <FileUploadOutlinedIcon />
                  </SvgIcon>
                  Export
                </TransparentButton>
              </Stack>
            </Stack>
            <Button onClick={() => setIsOpen(true)}>
              <PlusIcon className="mr-2"></PlusIcon>
              Add
            </Button>
          </Stack>
          {isOpen && (
            <PaperContainer>
              <UserForm setIsOpen={setIsOpen}></UserForm>
            </PaperContainer>
          )}
          <PaperContainer>
            {isLoading ? (
              <Spinner></Spinner>
            ) : isError ? (
              <>Error</>
            ) : (
              <Client data={data.users}></Client>
            )}
          </PaperContainer>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default StaffPage;

const formSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(4),
  image: z.string().optional(),
  phone: z.string().optional(),
  userType: z.enum(["student", "teacher"]),
});

type UsersFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  setIsOpen: (val: boolean) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ setIsOpen }) => {
  const [loading, setLoading] = useState(false);

  const title = "Create User";
  const description = "Add a new User";
  const action = "Create";

  const defaultValues: z.infer<typeof formSchema> = {
    name: "",
    email: "",
    password: "",
    image: "",
    phone: "",
    userType: "student",
  };

  const form = useForm<UsersFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const toast = useToastStore();
  const addUserMutation = api.users.createUser.useMutation();
  const trpcUtils = api.useContext();

  const onSubmit = (data: UsersFormValues) => {
    setLoading(true);
    addUserMutation.mutate(data, {
      onSuccess: (data) => {
        trpcUtils.invalidate();
        toast.success(`User created with email: ${data.user.email}`);
        setIsOpen(false);
        setLoading(false);
      },
      onError: () => {
        toast.error("Something went wrong.");
        setLoading(false);
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="space-y-2">
          <DialogHeader className="text-left text-xl font-medium">
            {title}
          </DialogHeader>
          <DialogHeader className="text-left text-sm">
            {description}
          </DialogHeader>
        </div>
        <Button
          disabled={loading}
          variant="x"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          <X />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-[65%] w-full flex-col justify-between p-0 md:h-full"
        >
          <div className="scrollbar-thumb-rounded-lg grid grid-cols-1 gap-4 overflow-auto px-4 pb-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="md:col-span-2 lg:col-span-3">
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      disabled={loading}
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Jon Doe"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={loading}
                      placeholder="Example@mail.com"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={loading}
                      placeholder="Password"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      disabled={loading}
                      placeholder="01234567899"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <Select
                    disabled={loading}
                    // @ts-ignore
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="pl-8">
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select user type"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator></Separator>
          <div className="flex w-full justify-end gap-4 self-end p-4">
            <Button
              disabled={loading}
              variant="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="secondary"
              type="reset"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button disabled={loading} type="submit">
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

interface Users extends User {
  address: Address | null;
  tasks: Task[];
}

const Client = ({ data }: { data: Users[] }) => {
  const [users, setUsers] = useState<Teacher[]>([]);
  const formattedData = data.map((user) => ({
    id: user.id,
    name: user.name || "no name",
    email: user.email || "no email",
    image: user.image || "no image",
    phone: user.phone || "no phone",
    taskCount: user.tasks.length,
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

export type Teacher = {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  taskCount: number;
  createdAt: string;
};

export const columns: ColumnDef<Teacher>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Info
          <Button
            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/account/${row.original.id}`}>
        <Stack alignItems="center" direction="row" spacing={2}>
          <Avatar src={`${row.original.image}` || ""}>
            {getInitials(`${row.original.name}` || "")}
          </Avatar>
          <Stack>
            <Typography
              className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
              variant="subtitle2"
            >
              {row.original.name}
            </Typography>
            <Typography className="text-sm font-normal text-slate-500">
              {row.original.email}
            </Typography>
          </Stack>
        </Stack>
      </Link>
    ),
  },
  {
    accessorKey: "taskCount",
    header: "Tasks",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          User Since
          <Button
            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>
      );
    },
  },
];

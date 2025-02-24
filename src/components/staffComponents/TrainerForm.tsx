import { api } from "@/lib/api";
import { useState } from "react";
import { EditIcon, PlusIcon, X } from "lucide-react";
import { Button, SpinnerButton } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastType, useToast } from "@/components/ui/use-toast";
import { validUserRoles } from "@/lib/enumsTypes";
import ImageUploader from "../ui/ImageUploader";
import MobileNumberInput from "@/components/ui/phone-number-input";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { TrainerColumn } from "@/components/staffComponents/StaffColumns";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email(),
  password: z.string(),
  phone: z.string(),
  image: z.string().optional(),
  trainerRole: z.enum([validUserRoles[4], validUserRoles[5]]),
});

type UsersFormValues = z.infer<typeof formSchema>;

interface TrainerFormProps {
  setIsOpen: (val: boolean) => void;
  initialData?: TrainerColumn
}

const TrainerForm: React.FC<TrainerFormProps> = ({ initialData, setIsOpen }) => {
  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const action = initialData ? "Update" : "Create";

  const defaultValues: UsersFormValues = {
    name: initialData ? initialData.name : "",
    email: initialData ? initialData.email : "",
    password: "",
    image: initialData?.image ? initialData.image : "",
    phone: initialData ? initialData.phone : "",
    trainerRole: initialData?.userRoles[0] ? initialData.userRoles[0] === "Teacher" ? "Teacher" : initialData.userRoles[0] === "Tester" ? "Tester" : "Teacher" : "Teacher",
  };

  const form = useForm<UsersFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const trpcUtils = api.useUtils();
  const { toast } = useToast()
  const createTrainerMutation = api.trainers.createTrainer.useMutation(
    createMutationOptions({
      trpcUtils,
      toast,
      loadingToast,
      setLoadingToast,
      successMessageFormatter: ({ trainer }) => `Trainer Created with email: ${trainer.email}`
    })
  );
  const editTrainerMutation = api.trainers.editTrainer.useMutation(
    createMutationOptions({
      trpcUtils,
      toast,
      loadingToast,
      setLoadingToast,
      successMessageFormatter: ({ trainer }) => `Trainer update with email: ${trainer.email}`
    })
  );

  const onSubmit = (data: UsersFormValues) => {
    if (!initialData) return createTrainerMutation.mutate(data);
    editTrainerMutation.mutate({ id: initialData.id, ...data });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-[65%] w-full flex-col justify-between p-0 md:h-full"
      >
        <div className="scrollbar-thumb-rounded-lg flex flex-col gap-4 overflow-auto px-4 pb-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader
                    value={field.value}
                    disabled={!!loadingToast}
                    onLoading={setUploadingImage}
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
                    disabled={!!loadingToast}
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
                    disabled={!!loadingToast}
                    placeholder="Example@mail.com"
                    {...field}
                    className="pl-8"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!initialData && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={!!loadingToast}
                      placeholder="Password"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <MobileNumberInput
                    placeholder="01234567899"
                    setValue={(val) => field.onChange(val)}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trainerRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trainer Role</FormLabel>
                <Select
                  disabled={!!loadingToast}
                  // @ts-ignore
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="pl-8">
                      <SelectValue
                        defaultValue={field.value}
                        placeholder="Select trainer role"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Tester">Tester</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
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
            disabled={!!loadingToast}
            customeColor="destructive"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            disabled={!!loadingToast}
            customeColor="secondary"
            type="reset"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <SpinnerButton isLoading={!!loadingToast || uploadingImage} type="submit" text={action} icon={initialData ? EditIcon : PlusIcon} />
        </div>
      </form>
    </Form>
  );
};

export default TrainerForm;

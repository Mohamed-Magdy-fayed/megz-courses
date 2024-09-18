import { api } from "@/lib/api";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { validTrainerRoles } from "@/lib/enumsTypes";
import ImageUploader from "../ui/ImageUploader";
import MobileNumberInput from "@/components/ui/phone-number-input";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email(),
  password: z.string().min(4),
  image: z.string().optional(),
  phone: z.string().optional(),
  trainerRole: z.enum(validTrainerRoles),
});

type UsersFormValues = z.infer<typeof formSchema>;

interface TrainerFormProps {
  setIsOpen: (val: boolean) => void;
}

const TrainerForm: React.FC<TrainerFormProps> = ({ setIsOpen }) => {
  const [loading, setLoading] = useState(false);

  const action = "Create";

  const defaultValues: UsersFormValues = {
    name: "",
    email: "",
    password: "",
    image: "",
    phone: "",
    trainerRole: "teacher",
  };

  const form = useForm<UsersFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createTrainerMutation = api.trainers.createTrainer.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast()

  const onSubmit = (data: UsersFormValues) => {
    setLoading(true);
    createTrainerMutation.mutate(data, {
      onSuccess: (data) => {
        trpcUtils.trainers.invalidate()
          .then(() => {
            toastSuccess(`Trainer created with email: ${data.trainer.email}`)
            setIsOpen(false);
            setLoading(false);
          });
      },
      onError: (error) => {
        toastError(error.message)
        setLoading(false);
      },
    });
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
                        placeholder="Select trainer role"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tester">Tester</SelectItem>
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
            customeColor="destructive"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            customeColor="secondary"
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
  );
};

export default TrainerForm;

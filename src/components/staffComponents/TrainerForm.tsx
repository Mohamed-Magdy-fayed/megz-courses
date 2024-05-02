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

const formSchema = z.object({
  name: z.string().nonempty(),
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

  const title = "Create";
  const description = "Add a new Trainer";
  const action = "Create";

  const defaultValues: z.infer<typeof formSchema> = {
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
                      <SelectTrigger className="pl-8 bg-white">
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
    </>
  );
};

export default TrainerForm;

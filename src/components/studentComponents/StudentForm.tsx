import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Typography } from "../ui/Typoghraphy";
import { toastType, useToast } from "../ui/use-toast";
import ImageUploader from "../ui/ImageUploader";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email(),
  password: z.string().min(4),
  image: z.string().optional(),
  phone: z.string().optional(),
  state: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type UsersFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  setIsOpen: (val: boolean) => void;
  initialData?: UsersFormValues;
}
const StudentForm: React.FC<StudentFormProps> = ({ setIsOpen, initialData }) => {
  const [loadingToast, setLoadingToast] = useState<toastType>();

  const { toast } = useToast()

  const action = initialData ? "Edit" : "Create";

  const defaultValues: UsersFormValues = initialData ? initialData : {
    name: "",
    email: "",
    password: "",
    image: "",
    phone: "",
    state: "",
    street: "",
    city: "",
    country: "",
  };

  const form = useForm<UsersFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const addUserMutation = api.users.createUser.useMutation({
    onMutate: () => setLoadingToast(toast({
      title: "Loading...",
      duration: 30000,
      variant: "info",
    })),
    onSuccess: ({ user }) => trpcUtils.courses.invalidate()
      .then(() => trpcUtils.invalidate()
        .then(() => {
          setIsOpen(false);
          loadingToast?.update({
            id: loadingToast.id,
            title: "Success",
            description: `User created with email: ${user.email}`,
            duration: 2000,
            variant: "success",
          })
        })
      ),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      duration: 2000,
      variant: "destructive",
    }),
    onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        }
  });
  const trpcUtils = api.useContext();

  const onSubmit = (data: UsersFormValues) => {
    addUserMutation.mutate(data);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col justify-between p-0 md:h-full"
        >
          <div className="scrollbar-thumb-rounded-lg flex flex-col gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      disabled={!!loadingToast}
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
                    <Input
                      type="tel"
                      disabled={!!loadingToast}
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
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={!!loadingToast}
                      placeholder="Street Name"
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
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={!!loadingToast}
                      placeholder="City Name"
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
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={!!loadingToast}
                      placeholder="State Name"
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={!!loadingToast}
                      placeholder="Country Name"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator></Separator>
          <div className="flex p-4 justify-end items-center gap-4 h-full">
            <Button
              disabled={!!loadingToast}
              customeColor="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <Typography variant={"buttonText"}>Cancel</Typography>
            </Button>
            <Button
              disabled={!!loadingToast}
              customeColor="accent"
              type="reset"
              onClick={() => form.reset()}
            >
              <Typography variant={"buttonText"}>Reset</Typography>
            </Button>
            <Button disabled={!!loadingToast} type="submit">
              <Typography variant={"buttonText"}>{action}</Typography>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentForm;

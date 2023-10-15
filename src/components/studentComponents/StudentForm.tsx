import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/ImageUpload";
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
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  name: z.string().nonempty(),
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
}
const StudentForm: React.FC<StudentFormProps> = ({ setIsOpen }) => {
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
    state: "",
    street: "",
    city: "",
    country: "",
  };

  const form = useForm<UsersFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const addUserMutation = api.users.createUser.useMutation();
  const trpcUtils = api.useContext();
  const { toast } = useToast()

  const onSubmit = (data: UsersFormValues) => {
    setLoading(true);
    addUserMutation.mutate(data, {
      onSuccess: (data) => {
        trpcUtils.invalidate();
        toast({
          variant: "success",
          description: `User created with email: ${data.user.email}`
        })
        setIsOpen(false);
        setLoading(false);
      },
      onError: (e) => {
        toast({
          variant: "destructive",
          description: e.message
        })
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div className="space-y-2 flex-col flex">
          <Typography className="text-left text-xl font-medium">
            {title}
          </Typography>
          <Typography className="text-left text-sm">
            {description}
          </Typography>
        </div>
        <Button
          disabled={loading}
          variant="x"
          customeColor={"destructive"}
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
          className="flex w-full flex-col justify-between p-0 md:h-full"
        >
          <div className="scrollbar-thumb-rounded-lg grid grid-cols-1 gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
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
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
              disabled={loading}
              customeColor="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <Typography variant={"buttonText"}>Cancel</Typography>
            </Button>
            <Button
              disabled={loading}
              customeColor="accent"
              type="reset"
              onClick={() => form.reset()}
            >
              <Typography variant={"buttonText"}>Reset</Typography>
            </Button>
            <Button disabled={loading} type="submit">
              <Typography variant={"buttonText"}>{action}</Typography>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentForm;

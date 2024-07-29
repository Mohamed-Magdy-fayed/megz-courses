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
import { toastType, useToast } from "@/components/ui/use-toast";
import { CardContent, CardFooter } from "../ui/card";
import ImageUploader from "../ui/ImageUploader";
import Spinner from "@/components/Spinner";
import { SalesAgentsColumn } from "@/components/salesAgentComponents/SalesAgentColumn";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email(),
  password: z.string().optional(),
  image: z.string().optional(),
  phone: z.string().optional(),
  salary: z.string(),
});

type SalesAgentFormValues = z.infer<typeof formSchema>;

interface SalesAgentFormProps {
  setIsOpen: (val: boolean) => void;
  initialData?: SalesAgentsColumn;
}

const SalesAgentForm: React.FC<SalesAgentFormProps> = ({ setIsOpen, initialData }) => {
  const [loadingToast, setLoadingToast] = useState<toastType>();

  const action = initialData ? "Edit" : "Create";

  const defaultValues: z.infer<typeof formSchema> = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    image: initialData?.image || "",
    phone: initialData?.phone || "",
    salary: initialData?.salary || "",
  };

  const form = useForm<SalesAgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createSalesAgentMutation = api.salesAgents.createSalesAgent.useMutation({
    onMutate: () => setLoadingToast(toast({
      title: "Loading...",
      description: <Spinner className="w-4 h-4" />,
      variant: "info",
    })),
    onSuccess: ({ user }) => trpcUtils.invalidate().then(() => {
      loadingToast?.update({
        id: loadingToast.id,
        title: "Success",
        description: `Sales Agent account created with email: ${user.email}`,
        variant: "success",
      })
      setIsOpen(false)
    }),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      variant: "destructive",
    }),
    onSettled: () => {
      loadingToast?.dismissAfter()
      setLoadingToast(undefined)
    },
  });

  const editSalesAgentMutation = api.salesAgents.editSalesAgent.useMutation({
    onMutate: () => setLoadingToast(toast({
      title: "Loading...",
      description: <Spinner className="w-4 h-4" />,
      variant: "info",
    })),
    onSuccess: () => trpcUtils.invalidate().then(() => {
      loadingToast?.update({
        id: loadingToast.id,
        title: "Success",
        description: `Sales Agent account updated`,
        variant: "success",
      })
      setIsOpen(false)
    }),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      variant: "destructive",
    }),
    onSettled: () => {
      loadingToast?.dismissAfter()
      setLoadingToast(undefined)
    },
  });
  const trpcUtils = api.useContext();
  const { toast } = useToast()

  const handleSubmit = ({ email, name, salary, image, password, phone }: SalesAgentFormValues) => {
    if (!!password) return createSalesAgentMutation.mutate({
      email, name, password, salary, image, phone
    });
    if (initialData) return editSalesAgentMutation.mutate({
      id: initialData.id, email, name, salary, phone, image,
    })
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(form.getValues())
        }}
        className="flex w-full flex-col justify-between p-0"
      >
        <CardContent className="grid gap-4 p-4">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader
                    value={field.value}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                    disabled={!!loadingToast}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={!!loadingToast}
                    placeholder="$12000"
                    {...field}

                  />
                </FormControl>
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
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
        <Separator></Separator>
        <CardFooter className="flex w-full justify-end gap-4 p-4">
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
          <Button disabled={!!loadingToast} type="submit">
            {action}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default SalesAgentForm;

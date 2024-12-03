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
import MobileNumberInput from "@/components/ui/phone-number-input";
import { validUserRoles } from "@/lib/enumsTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email(),
  password: z.string(),
  image: z.string().optional(),
  phone: z.string(),
  agentType: z.enum([validUserRoles[6], validUserRoles[2]]),
});

type SalesAgentFormValues = z.infer<typeof formSchema>;

interface SalesAgentFormProps {
  setIsOpen: (val: boolean) => void;
  initialData?: SalesAgentsColumn;
}

const SalesAgentForm: React.FC<SalesAgentFormProps> = ({ setIsOpen, initialData }) => {
  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const action = initialData ? "Edit" : "Create";

  const defaultValues: z.infer<typeof formSchema> = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    image: initialData?.image || "",
    phone: initialData?.phone || "",
    agentType: initialData?.agentType[0] ? initialData.agentType[0] === "OperationAgent" ? "OperationAgent" : initialData.agentType[0] === "SalesAgent" ? "SalesAgent" : "SalesAgent" : "SalesAgent",
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
        description: `Sales Agent account Created with email: ${user.email}`,
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
  const trpcUtils = api.useUtils();
  const { toast } = useToast()

  const handleSubmit = (data: SalesAgentFormValues) => {
    if (initialData) return editSalesAgentMutation.mutate({
      id: initialData.id, ...data
    })
    if (!data.password) return toast({ title: "Error", description: "Please enter a password!", variant: "destructive" })
    createSalesAgentMutation.mutate({ ...data, password: data.password });
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
                    onLoading={setUploadingImage}
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
                  <MobileNumberInput
                    setValue={(val) => field.onChange(val)}
                    disabled={!!loadingToast}
                    placeholder="01X XXXXXXXX"
                    onError={(isError) => {
                      form.clearErrors("phone")
                      if (isError) {
                        form.setError("phone", { message: "Not a valid number!" })
                        return
                      }
                    }}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Role</FormLabel>
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
                        placeholder="Select agent role"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SalesAgent">Sales Agent</SelectItem>
                    <SelectItem value="OperationAgent">Operation Agent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
          <Button disabled={!!loadingToast || uploadingImage} type="submit">
            {action}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default SalesAgentForm;

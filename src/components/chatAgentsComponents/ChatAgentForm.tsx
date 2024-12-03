import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ui/ImageUploader";
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
import MobileNumberInput from "@/components/ui/phone-number-input";
import { createMutationOptions } from "@/lib/mutationsHelper";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  email: z.string().email(),
  phone: z.string().min(1, "Phone can't be empty"),
  image: z.string().optional(),
  password: z.string().optional(),
});

type ChatAgentsFormValues = z.infer<typeof formSchema>;

interface ChatAgentFormProps {
  setIsOpen: (val: boolean) => void;
  initialData?: Omit<ChatAgentsFormValues, "password"> & { id: string };
}

const ChatAgentForm: React.FC<ChatAgentFormProps> = ({ setIsOpen, initialData }) => {
  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const action = initialData ? "Confirm" : "Create";

  const defaultValues: ChatAgentsFormValues = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    image: initialData?.image || "",
    password: "",
  };

  const form = useForm<ChatAgentsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const trpcUtils = api.useUtils();
  const { toast } = useToast()
  const createSalesAgentMutation = api.chatAgents.createChatAgent.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      successMessageFormatter: ({ agent }) => {
        setIsOpen(false)
        return `Chat Agent account Created with email: ${agent.user.email}`
      }
    })
  );
  const editSalesAgentMutation = api.users.editUser.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      toast,
      trpcUtils,
      successMessageFormatter: () => {
        setIsOpen(false)
        return `Chat agent account updated`
      }
    })
  );

  const onSubmit = (data: ChatAgentsFormValues) => {
    if (initialData) return editSalesAgentMutation.mutate({ id: initialData.id, ...data })
    if (!data.password) return toast({ title: "Error", description: "Please enter a password", variant: "destructive" })
    createSalesAgentMutation.mutate({ ...data, password: data.password });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                    disabled={!!loadingToast}
                    onChange={(url) => field.onChange(url)}
                    onLoading={setUploadingImage}
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!initialData && <FormField
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
          />}
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

export default ChatAgentForm;

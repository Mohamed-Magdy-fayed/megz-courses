import { api } from "@/lib/api";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter } from "../ui/card";

const formSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(4),
});

type ChatAgentsFormValues = z.infer<typeof formSchema>;

interface ChatAgentFormProps {
  setIsOpen: (val: boolean) => void;
}

const ChatAgentForm: React.FC<ChatAgentFormProps> = ({ setIsOpen }) => {
  const [loading, setLoading] = useState(false);

  const title = "Sales Operator";
  const description = "Create Sales Operator Account";
  const action = "Create";

  const defaultValues: z.infer<typeof formSchema> = {
    name: "",
    email: "",
    password: "",
  };

  const form = useForm<ChatAgentsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createSalesAgentMutation = api.chatAgents.createChatAgent.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast()

  const onSubmit = (data: ChatAgentsFormValues) => {
    setLoading(true);
    createSalesAgentMutation.mutate(data, {
      onSuccess: (data) => {
        trpcUtils.chatAgents.invalidate().then(() => {
          toastSuccess(`Chat Agent account created with email: ${data.agent.user.email}`)
          setLoading(false);
          form.reset()
          setIsOpen(false)
        });
      },
      onError: (error) => {
        toastError(error.message)
        setLoading(false);
      },
    });
  };

  return (
    <Card>
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
          className="flex w-full flex-col justify-between p-0"
        >
          <CardContent className="grid grid-cols-12 gap-4 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
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
                <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={loading}
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
              name="password"
              render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={loading}
                      placeholder="Password"
                      {...field}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <Separator></Separator>
          <CardFooter className="flex w-full justify-end gap-4 p-4">
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
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ChatAgentForm;

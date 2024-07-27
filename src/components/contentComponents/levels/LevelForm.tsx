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
import { Typography } from "@/components/ui/Typoghraphy";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  slug: z.string().min(1, "Slug can't be empty").regex(/^\S*$/, "No spaces allowed"),
});

type LevelFormValues = z.infer<typeof formSchema>;

interface LevelFormProps {
  setIsOpen: (val: boolean) => void;
  initialData?: LevelFormValues;
  courseSlug: string;
}
const LevelForm: React.FC<LevelFormProps> = ({ setIsOpen, initialData, courseSlug }) => {
  const [loadingToast, setLoadingToast] = useState<toastType>();

  const { toast } = useToast()

  const action = initialData ? "Edit" : "Create";

  const defaultValues: LevelFormValues = initialData ? initialData : {
    name: "",
    slug: "",
  };

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const addLevelMutation = api.levels.createLevel.useMutation({
    onMutate: () => setLoadingToast(toast({
      title: "Loading...",
      duration: 3000,
      variant: "info",
    })),
    onSuccess: ({ level }) => trpcUtils.invalidate()
      .then(() => {
        setIsOpen(false);
        loadingToast?.update({
          id: loadingToast.id,
          title: "Success",
          description: `Level created with name: ${level.name}`,
          variant: "success",
        })
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
        }
  });
  const trpcUtils = api.useContext();

  const onSubmit = (data: LevelFormValues) => {
    addLevelMutation.mutate({ ...data, courseSlug });
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!!loadingToast}
                      placeholder="Level 1"
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={!!loadingToast}
                      placeholder="No spaces"
                      {...field}
                      className="pl-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LevelForm;

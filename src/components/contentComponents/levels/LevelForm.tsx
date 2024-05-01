import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().nonempty(),
  code: z.string().nonempty(),
});

type LevelFormValues = z.infer<typeof formSchema>;

const LevelForm = ({
  setIsOpen,
  id,
}: {
  setIsOpen: (val: boolean) => void;
  id: string;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { name: "", code: "" } });
  const createlevelMutation = api.levels.createLevel.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast()

  const onSubmit = (data: LevelFormValues) => {
    setLoading(true);
    createlevelMutation.mutate(
      { ...data, courseId: id },
      {
        onSuccess: ({ level }) => {
          toastSuccess(`Your new level (${level.name}) is ready!`)
          trpcUtils.courses.invalidate();
          setLoading(false);
        },
        onError: (error) => {
          toastError(error.message)
          setLoading(false);
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>Create level</div>
        <Button variant={"x"} onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>level Name</FormLabel>
                <FormControl>
                  <Input placeholder="Level 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Level Code</FormLabel>
                <FormControl>
                  <Input placeholder="L1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
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
              Create Level
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LevelForm;

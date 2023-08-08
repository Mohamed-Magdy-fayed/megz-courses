import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { IconButton } from "@mui/material";
import { X } from "lucide-react";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/zustand/store";
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
  const toast = useToastStore();

  const onSubmit = (data: LevelFormValues) => {
    setLoading(true);
    createlevelMutation.mutate(
      { ...data, courseId: id },
      {
        onSuccess: ({ level }) => {
          toast.success(`Your new level (${level.name}) is ready!`);
          trpcUtils.levels.invalidate();
          setLoading(false);
        },
        onError: () => {
          toast.error("somthing went wrong!");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>Create level</div>
        <IconButton onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </IconButton>
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
              variant="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="secondary"
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

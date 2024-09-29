import { useState } from "react";
import { api } from "@/lib/api";
import { z } from "zod";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import ImageUploader from "@/components/ui/ImageUploader";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import NotFoundPage from "@/pages/404";
import MobileNumberInput from "@/components/ui/phone-number-input";
import { createMutationOptions } from "@/lib/mutationsHelper";

export const setupFormSchema = z.object({
  setupKey: z.string(),
  name: z.string(),
  email: z.string().email("Not a valid Email").min(5, "Please add your email"),
  password: z.string().min(6, "Password must be at least 6 characters long")
    .refine(
      (value) =>
        /[a-z]/.test(value) &&   // At least one lowercase letter
        /[A-Z]/.test(value) &&   // At least one uppercase letter
        /[0-9]/.test(value) &&   // At least one number
        /[!@#$%^&*(),.?":{}|<>]/.test(value),  // At least one special character
      {
        message: "Password must include uppercase, lowercase, number, and special character",
      }
    ),
  image: z.string().optional(),
  phone: z.string(),
});

export type SetupFormValues = z.infer<typeof setupFormSchema>;

const SetupPage = () => {
  const { toast } = useToast()
  const router = useRouter()
  const session = useSession()

  const defaultValues: SetupFormValues = {
    setupKey: "",
    name: "",
    image: "",
    email: "",
    password: "",
    phone: "",
  }

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupFormSchema),
    defaultValues,
  });

  const [loadingToast, setLoadingToast] = useState<toastType>();
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const trpcUtils = api.useContext();
  const setupQuery = api.setup.isSetupAlready.useQuery();
  const setupMutation = api.setup.start.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: () => `Setup Completed Successfully! now login with the admin's email and password`,
      toast,
      trpcUtils,
      loadingMessage: "Configuring..."
    })
  )

  const onSubmit = ({ email, name, password, phone, image, setupKey }: SetupFormValues) => {
    setupMutation.mutate({ name, email, password, phone, setupKey, image })
  }

  if (session.status !== "unauthenticated") return (
    <NotFoundPage />
  )

  if (session.status === "unauthenticated" && ((!!setupQuery.data?.isSetupAlready || setupQuery.isLoading))) return (
    <NotFoundPage />
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-8 space-y-4 flex flex-col"
      >
        <ConceptTitle className="text-center leading-8">Welcome To Megz Learning<br></br>Initial Setup</ConceptTitle>
        <Separator />
        <Typography
          className="text-center"
          variant={"bodyText"}
        >
          From here you can setup your super admin account using the{" "}
          <WrapWithTooltip
            text="This is the key you obtained when purchasing your Megz Learning license!">
            <strong
              className="text-primary"
            >
              setup key
            </strong>
          </WrapWithTooltip>
          {" "}provided by the Megz Learning team
        </Typography>
        <div className="md:grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="setupKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setup Key</FormLabel>
                <FormControl>
                  <Input
                    disabled={!!loadingToast}
                    placeholder="XXXXXXXX"
                    {...field}
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
                <FormLabel>Admin Name</FormLabel>
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
                <FormLabel>Admin Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={!!loadingToast}
                    placeholder="example@mail.com"
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
                <FormLabel>Admin Phone</FormLabel>
                <FormControl>
                  <MobileNumberInput
                    placeholder="01111111111"
                    setValue={field.onChange}
                    value={field.value}
                    onError={(e) => {
                      if (!!e) {
                        form.setError("phone", { message: "Invalid Phone Number" })
                        return
                      }
                      form.clearErrors("phone")
                    }}
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
                <FormLabel>Admin Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={!!loadingToast}
                    type="password"
                    placeholder="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader
                    value={field.value}
                    disabled={!!loadingToast}
                    onLoading={setUploadingImage}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full md:col-start-2" type="submit" disabled={!!loadingToast || !!uploadingImage}>Start Setup</Button>
        </div>
      </form>
    </Form>
  )
};

export default SetupPage;

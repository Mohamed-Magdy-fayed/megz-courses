import ImageUploadButton from "@/components/students/ImageUploadButton";
import { api } from "@/lib/api";
import { Address, User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Loader } from "lucide-react";
import { Typography } from "../../ui/Typoghraphy";
import { Separator } from "../../ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ChangePassword from "../UserDataForm/ChangePasswordForm";
import { useToast } from "@/components/ui/use-toast";

export const Account = ({
  user,
}: {
  user:
  | User & {
    address: Address | null;
  };
}) => {
  const { toast } = useToast()
  const trpcUtils = api.useContext();

  const editUserImage = api.users.editUserImage.useMutation({
    onSuccess() {
      trpcUtils.users.invalidate();
    },
  });
  const isIdle = editUserImage.isIdle;
  const isLoading = editUserImage.isLoading;
  const isSuccess = editUserImage.isSuccess;

  const handleChange = (url: string) => {
    if (!user?.email) return toast({ variant: "destructive", description: "no email" });
    editUserImage.mutate({ url, email: user.email });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col items-center p-4">
          {!isLoading && (isSuccess || isIdle) && (
            <Avatar className="w-20 h-20 mb-1">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          )}
          {isLoading && !isSuccess && <Loader ></Loader>}
          <Typography variant="secondary">
            {user?.name}
          </Typography>
          <Typography>
            {user?.address?.city} {user?.address?.state}
          </Typography>
          <Typography>
            {user?.address?.country}
          </Typography>
        </CardContent>
        <Separator />
        <CardFooter className="flex items-center justify-center p-4">
          <ImageUploadButton
            isAccount
            loading={isLoading}
            handleChange={handleChange}
          />
        </CardFooter>
      </Card>
      <ChangePassword />
    </div>
  );
};

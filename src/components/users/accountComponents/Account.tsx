import ImageUploadButton from "@/components/students/ImageUploadButton";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Loader } from "lucide-react";
import { Typography } from "../../ui/Typoghraphy";
import { Separator } from "../../ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ChangePassword from "../UserDataForm/ChangePasswordForm";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { UserGetPayload } from "@/pages/account/[id]";

export const Account = ({ user }: {user: UserGetPayload}) => {
  const { toastError, toastSuccess } = useToast()
  const session = useSession()
  const pathname = useRouter().pathname
  const isOwnAccount = pathname === "/account" || pathname === "/my_account"
  const trpcUtils = api.useContext();

  const editUserImage = api.users.editUserImage.useMutation({
    onSuccess() {
      trpcUtils.users.invalidate()
        .then(() => {
          toastSuccess("Image updated successfully!")
        })
    },
    onError(error) {
      toastError(error.message)
    },
  });
  const isIdle = editUserImage.isIdle;
  const isLoading = editUserImage.isLoading;
  const isSuccess = editUserImage.isSuccess;

  const handleChange = (url: string) => {
    if (!user?.email) return toastError("no email");
    editUserImage.mutate({ url, email: user.email }, {
      onSuccess: () => {
      }
    });
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
        {(session.data?.user.userType === "admin" || isOwnAccount) && (
          <>
            <Separator />
            <CardFooter className="flex items-center justify-center p-4">
              <ImageUploadButton
                isAccount
                loading={isLoading}
                handleChange={handleChange}
              />
            </CardFooter>
          </>
        )}
      </Card>
      {(isOwnAccount) && <ChangePassword />}
    </div>
  );
};

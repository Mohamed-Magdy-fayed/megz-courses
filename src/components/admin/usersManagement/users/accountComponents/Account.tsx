import ImageUploadButton from "@/components/admin/usersManagement/students/ImageUploadButton";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Loader } from "lucide-react";
import { Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ChangePassword from "../UserDataForm/ChangePasswordForm";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { hasPermission } from "@/server/permissions";
import { Prisma } from "@prisma/client";

export const Account = ({ user }: { user: Prisma.UserGetPayload<{}> }) => {
  const { toastError, toastSuccess } = useToast()
  const session = useSession()
  const pathname = useRouter().pathname
  const isOwnAccount = pathname === "/admin/users_management/account" || pathname === "/student/my_account"
  const trpcUtils = api.useUtils();

  const editUserImage = api.users.editUserImage.useMutation({
    onSuccess({ updatedUser }) {
      trpcUtils.users.invalidate()
        .then(() => {
          session.update({
            ...updatedUser,
            picture: updatedUser.image,
          }).then(() => toastSuccess("Image updated successfully!"))
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
        {session.data?.user && hasPermission(session.data?.user, "users", "update", user) && (
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

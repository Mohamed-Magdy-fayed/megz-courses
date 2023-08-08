import ImageUploadButton from "@/components/students/ImageUploadButton";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Address, User } from "@prisma/client";

export const Account = ({
  user,
}: {
  user:
    | User & {
        address: Address | null;
      };
}) => {
  const trpcUtils = api.useContext();

  const editUserImage = api.users.editUserImage.useMutation({
    onSuccess() {
      trpcUtils.users.invalidate();
    },
  });
  const isIdle = editUserImage.isIdle;
  const isLoading = editUserImage.isLoading;
  const isSuccess = editUserImage.isSuccess;

  const toast = useToastStore((state) => state);
  const handleChange = (url: string) => {
    if (!user?.email) return toast.error("no email");
    editUserImage.mutate({ url, email: user.email });
  };

  return (
    <PaperContainer>
      <Box component="div" className="flex flex-col items-center p-4">
        {!isLoading && (isSuccess || isIdle) && (
          <Avatar
            src={user?.image || ""}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
            }}
          />
        )}
        {isLoading && !isSuccess && <CircularProgress></CircularProgress>}
        <Typography gutterBottom variant="h5">
          {user?.name}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {user?.address?.city} {user?.address?.state}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {user?.address?.country}
        </Typography>
      </Box>
      <Divider />
      <Box component="div" className="flex items-center justify-center p-4">
        <ImageUploadButton
          isAccount
          loading={isLoading}
          handleChange={handleChange}
        />
      </Box>
    </PaperContainer>
  );
};

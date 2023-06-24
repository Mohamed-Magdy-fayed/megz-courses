import { PaperContainer } from "@/components/designPattern/PaperContainers";
import ImageUploadButton from "@/components/students/ImageUploadButton";
import { api } from "@/utils/api";
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
  loading,
}: {
  user:
    | User & {
        address: Address | null;
      };
  loading: boolean;
}) => {
  const trpcUtils = api.useContext();

  const editStudentImage = api.students.editStudentImage.useMutation({
    onSuccess() {
      trpcUtils.account.getByEmail.invalidate();
      trpcUtils.account.getById.invalidate();
    },
  });
  const isIdle = editStudentImage.isIdle;
  const isLoading = editStudentImage.isLoading;
  const isSuccess = editStudentImage.isSuccess;

  const toast = useToastStore((state) => state);
  const handleChange = (url: string) => {
    console.log(user);

    if (!user?.email) return toast.error("no email");
    editStudentImage.mutate({ url, email: user.email });
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
          loading={loading}
          handleChange={handleChange}
        />
      </Box>
    </PaperContainer>
  );
};

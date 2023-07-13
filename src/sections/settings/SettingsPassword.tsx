import { useCallback, useState, ChangeEvent, FormEventHandler } from "react";
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { useToastStore } from "@/zustand/store";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

export const SettingsPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const toast = useToastStore();

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    []
  );

  const handleConfirmChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setConfirm(event.target.value);
    },
    []
  );

  const sesstion = useSession();
  const resetPasswordMutation = api.auth.resetPassword.useMutation();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    console.log(password);
    console.log(confirm);

    if (password !== confirm) return toast.error("Passwords don't match!");

    if (!sesstion.data?.user.email) return toast.error("not authenticated");

    resetPasswordMutation.mutate({
      newPassword: password,
      email: sesstion.data?.user.email,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaperContainer>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 400 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              onChange={handlePasswordChange}
              type="password"
              value={password}
            />
            <TextField
              fullWidth
              label="Password (Confirm)"
              name="confirm"
              onChange={handleConfirmChange}
              type="password"
              value={confirm}
            />
          </Stack>
        </CardContent>
        <Divider />
        <Box component="div" className="flex justify-end p-4">
          <Button variant="contained" type="submit" className="bg-primary">
            Update
          </Button>
        </Box>
      </PaperContainer>
    </form>
  );
};

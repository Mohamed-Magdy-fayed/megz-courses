import * as React from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { api } from "@/utils/api";
import { Box, Stack, Typography } from "@mui/material";
import { Address, User } from "@prisma/client";
import { Student } from "@/pages/students";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AlertDialogSlideProps {
  buttonLabel: string;
  buttonProps?: ButtonProps;
  users: Student[];
}

export default function AlertDialogSlide({
  buttonLabel,
  buttonProps,
  users,
}: AlertDialogSlideProps) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteStudent = api.students.deleteStudent.useMutation();
  const trpcUtils = api.useContext();

  const handleDelete = () => {
    deleteStudent.mutate(
      { userIds: users.map((user) => user.id) },
      {
        onSuccess() {
          trpcUtils.students.getStudents.invalidate();
        },
      }
    );
    setOpen(false);
  };

  return (
    <div>
      <Button {...buttonProps} onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure that you want to delete{" "}
            {users.length > 1 ? "these" : "this"} user?
          </DialogContentText>
          <Stack direction="column">
            {users.map((user) => (
              <Typography key={user.id} className="text-error">
                {user.email}
              </Typography>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

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
  userIds: string[];
}

export default function AlertDialogSlide({
  buttonLabel,
  buttonProps,
  userIds,
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
      { userIds },
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
            {userIds.length > 1 ? "these" : "this"} user?
          </DialogContentText>
          <Stack direction="column">
            {userIds.map((id) => (
              <Typography key={id} className="text-error">
                {id}
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

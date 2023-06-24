import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
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
  Trigger: () => React.JSX.Element;
  users: Student[];
}

function DialogContainer({
  textContent,
  extraContent,
  handleAccept,
  open,
  setOpen,
}: {
  textContent?: React.ReactNode;
  extraContent?: React.ReactNode;
  handleAccept: () => void;
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [innerOpen, innerSetOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    innerSetOpen(false);
  };

  return (
    <Dialog
      open={open || innerOpen}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Alert"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {textContent}
        </DialogContentText>
        {extraContent}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAccept}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export function useAlertDialogSlide() {
  const [open, setOpen] = React.useState(false);

  return {
    open,
    setOpen,
    DialogContainer,
  };
}

import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { useToastStore } from "@/zustand/store";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SnackbarContainer() {
  const toast = useToastStore((state) => state);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    toast.close();
  };

  return (
    <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={toast.type} sx={{ width: "100%" }}>
        {toast.msg}
      </Alert>
    </Snackbar>
  );
}

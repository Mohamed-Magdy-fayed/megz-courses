import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button, { ButtonProps } from "@mui/material/Button";
import {
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Scrollbar from "./Scrollbar";

function TransitionsModal({
  Content,
  modalActions,
  buttonChildren,
  buttonProps,
  modalTitle,
  open,
  setOpen,
  dispatchCloseModal,
}: {
  Content: JSX.Element;
  modalActions: React.ReactNode;
  buttonChildren: React.ReactNode;
  buttonProps: ButtonProps;
  modalTitle: string;
  open: boolean;
  dispatchCloseModal: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [innerOpen, InneSetOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
    InneSetOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    InneSetOpen(false);
  };

  React.useEffect(() => {
    handleClose();
  }, [dispatchCloseModal]);

  return (
    <div>
      <Button {...buttonProps} onClick={handleOpen}>
        {buttonChildren}
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={innerOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box
            component="div"
            className="absolute inset-8 flex flex-col overflow-auto rounded-lg bg-white shadow-md md:bottom-auto"
          >
            <Stack
              direction="row"
              className="h-fit w-full items-center justify-between p-4"
            >
              <Typography
                id="transition-modal-title"
                variant="h6"
                component="h2"
              >
                {modalTitle}
              </Typography>
              <IconButton type="button" color="warning" onClick={handleClose}>
                <Close></Close>
              </IconButton>
            </Stack>
            <Divider></Divider>
            <Scrollbar>{Content}</Scrollbar>
            <Divider className="mt-auto" />
            <Box
              component="div"
              className="!mt-0 flex w-full justify-between gap-4 p-4"
            >
              {modalActions}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export const useTransitionsModal = () => {
  const [open, setOpen] = React.useState(false);

  return {
    open,
    setOpen,
    TransitionsModal,
  };
};

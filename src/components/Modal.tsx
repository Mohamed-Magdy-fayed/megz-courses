import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button, { ButtonProps } from "@mui/material/Button";
import { Divider, IconButton, Stack, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import Scrollbar from "./Scrollbar";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function TransitionsModal({
  Content,
  buttonChildren,
  buttonProps,
  modalTitle,
}: {
  Content: ({ handleClose }: { handleClose: () => void }) => JSX.Element;
  buttonChildren: React.ReactNode;
  buttonProps: ButtonProps;
  modalTitle: string;
}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button {...buttonProps} onClick={handleOpen}>
        {buttonChildren}
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
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
            className="absolute inset-8 grid overflow-auto rounded-lg bg-white shadow-md md:bottom-auto"
          >
            <Stack
              direction="row"
              className="w-full items-center justify-between p-4"
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
            <Scrollbar>
              <Content handleClose={handleClose} />
            </Scrollbar>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Unstable_Grid2 as Grid,
  CircularProgress,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { ConceptTitle } from "@/components/designPattern/Typoghraphy";
import { TransparentButton } from "@/components/designPattern/Buttons";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useTransitionsModal } from "@/components/Modal";
import { useState } from "react";
import { PaperContainer } from "@/components/designPattern/PaperContainers";
import { useBasicTabs } from "@/components/designPattern/Tabs";
import { SearchInput } from "@/components/designPattern/SearchInput";
import EnhancedTable from "@/components/designPattern/Tabels";

const Page = () => {
  const [dispatchReset, setDispatchReset] = useState(true);
  const [dispatchCloseModal, setDispatchCloseModal] = useState(true);
  const transitionsModal = useTransitionsModal();
  const { value, setValue, BasicTabs } = useBasicTabs();

  return (
    <DashboardLayout>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <ConceptTitle>Staff</ConceptTitle>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <TransparentButton>
                    <SvgIcon fontSize="small">
                      <FileDownloadOutlinedIcon />
                    </SvgIcon>
                    Import
                  </TransparentButton>
                  <TransparentButton>
                    <SvgIcon fontSize="small">
                      <FileUploadOutlinedIcon />
                    </SvgIcon>
                    Export
                  </TransparentButton>
                </Stack>
              </Stack>
              <div>
                <transitionsModal.TransitionsModal
                  dispatchCloseModal={dispatchCloseModal}
                  modalActions={
                    <>
                      <Button
                        onClick={() => setDispatchReset(!dispatchReset)}
                        variant="contained"
                        color="warning"
                        className="bg-warning"
                      >
                        Clear
                      </Button>
                      <Button variant="contained" className="bg-primary">
                        {false ? (
                          <>
                            <CircularProgress
                              size={20}
                              sx={{ mr: 2 }}
                            ></CircularProgress>
                            Loading
                          </>
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </>
                  }
                  open={transitionsModal.open}
                  setOpen={transitionsModal.setOpen}
                  Content={<></>}
                  modalTitle="Add a staff member"
                  buttonProps={{
                    startIcon: (
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    ),
                    className: "bg-primary",
                    variant: "contained",
                  }}
                  buttonChildren={"Add"}
                />
              </div>
            </Stack>
            <PaperContainer>
              <BasicTabs
                {...{
                  tabs: ["All", "Admins", "Operations"],
                  textColor: "primary",
                  indicatorColor: "primary",
                  setValue: setValue,
                }}
              />

              <SearchInput />
              <EnhancedTable />
            </PaperContainer>
          </Stack>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default Page;

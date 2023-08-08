import { TransparentButton } from "@/components/ui/Buttons";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { Box, Stack, SvgIcon } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import UserForm from "@/components/staffComponents/UserForm";
import StaffClient from "@/components/staffComponents/StaffClient";

const StaffPage = () => {
  const { data, isLoading, isError } = api.users.getUsers.useQuery({
    userType: "teacher",
  });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <Box component="main">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <ConceptTitle>Teachers</ConceptTitle>
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
            <Button onClick={() => setIsOpen(true)}>
              <PlusIcon className="mr-2"></PlusIcon>
              Add
            </Button>
          </Stack>
          {isOpen && (
            <PaperContainer>
              <UserForm setIsOpen={setIsOpen}></UserForm>
            </PaperContainer>
          )}
          <PaperContainer>
            {isLoading ? (
              <Spinner></Spinner>
            ) : isError ? (
              <>Error</>
            ) : (
              <StaffClient data={data.users}></StaffClient>
            )}
          </PaperContainer>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default StaffPage;

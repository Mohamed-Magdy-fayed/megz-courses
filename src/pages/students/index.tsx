import AppDrawer from "@/components/layout/AppDrawer";
import { TransparentButton } from "@/components/ui/Buttons";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { Avatar, Box, CircularProgress, Stack, SvgIcon } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useTransitionsModal } from "@/components/Modal";
import { useCallback, useState } from "react";
import { useToastStore } from "@/zustand/store";
import ImageUploadButton from "@/components/students/ImageUploadButton";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { BasicTabs, useBasicTabs } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import Scrollbar from "@/components/Scrollbar";
import { getAddress } from "@/lib/utils";
import { format } from "date-fns";
import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { columns } from "./columns";
import Client from "./client";
import { UserForm } from "./form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const StudentsPage = () => {
  const { data, isLoading, isError } = api.users.getUsers.useQuery({
    userType: "student",
  });

  console.log(data);

  const transitionsModal = useTransitionsModal();
  const { value, setValue, BasicTabs } = useBasicTabs();

  const [loading, setLoading] = useState(false);
  const [dispatchReset, setDispatchReset] = useState(true);
  const [dispatchCloseModal, setDispatchCloseModal] = useState(true);
  const [image, setImage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleImageChange = useCallback((url: string) => {
    setImage(url);
  }, []);

  const handleAddUser = useCallback(() => {
    console.log("hi");
  }, []);

  const onChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  };

  return (
    <AppDrawer>
      <Box component="main">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <ConceptTitle>Students</ConceptTitle>
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
            <BasicTabs
              {...{
                tabs: ["All", "Accepts Marketing", "Prospect", "Returning"],
                textColor: "primary",
                indicatorColor: "primary",
                setValue: setValue,
              }}
            />
            {isLoading ? (
              <Spinner></Spinner>
            ) : isError ? (
              <>Error</>
            ) : (
              <Client data={data.users}></Client>
            )}
          </PaperContainer>
        </Stack>
      </Box>
    </AppDrawer>
  );
};

export default StudentsPage;

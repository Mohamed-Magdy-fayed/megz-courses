import { useCallback, useState } from "react";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  SvgIcon,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useTransitionsModal } from "@/components/Modal";
import { api } from "@/utils/api";
import Spinner from "@/components/Spinner";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { TransparentButton } from "@/components/designPattern/Buttons";
import { ConceptTitle } from "@/components/designPattern/Typoghraphy";
import { PaperContainer } from "@/components/designPattern/PaperContainers";
import { useBasicTabs } from "@/components/designPattern/Tabs";
import { SearchInput } from "@/components/designPattern/SearchInput";
import EnhancedTable from "@/components/designPattern/Tabels";
import { useFormsContainer } from "@/components/designPattern/Forms";
import ImageUploadButton from "@/components/students/ImageUploadButton";
import { useToastStore } from "@/zustand/store";
import { z } from "zod";

export interface Student {
  id: string;
  address?: {
    city?: string | null;
    country?: string | null;
    state?: string | null;
    street?: string | null;
  };
  image?: string | null;
  createdAt: Date;
  email: string | null;
  name: string | null;
  phone?: string | null;
}

const valuesSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
});

export interface ValuesTypes {
  name: string;
  email: string;
  password: string;
  phone?: string;
  state?: string;
  country?: string;
  street?: string;
  city?: string;
}

const Page = () => {
  const [loading, setLoading] = useState(false);
  const getStudents = api.students.getStudents.useQuery();

  const { value, setValue, BasicTabs } = useBasicTabs();
  const [dispatchReset, setDispatchReset] = useState(true);
  const [dispatchCloseModal, setDispatchCloseModal] = useState(true);
  const [image, setImage] = useState("");
  const handleImageChange = useCallback((url: string) => {
    setImage(url);
  }, []);

  const transitionsModal = useTransitionsModal();
  const Forms = useFormsContainer(
    {
      name: "",
      email: "",
      password: "",
      phone: "",
      state: "",
      country: "",
      street: "",
      city: "",
    },
    dispatchReset
  );

  const trpcUrils = api.useContext();
  const createStudent = api.students.createStudent.useMutation();
  const toast = useToastStore((state) => state);

  const handleAddUser = useCallback(() => {
    console.log(Forms.values);

    setLoading(true);
    createStudent.mutate(
      { ...Forms.values, image },
      {
        onSuccess(data) {
          if (data.error?.message) return toast.error(data.error?.message);
          toast.success(`User created with the email: ${data.user?.email}`);
        },
        onSettled() {
          trpcUrils.students.getStudents.invalidate();
          transitionsModal.setOpen(false);
          setDispatchCloseModal(!dispatchCloseModal);
          setLoading(false);
          setDispatchReset(!dispatchReset);
          setImage("");
        },
      }
    );
  }, [Forms.values]);

  return (
    <DashboardLayout>
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
            <div>
              <transitionsModal.TransitionsModal
                dispatchCloseModal={dispatchCloseModal}
                modalActions={
                  <>
                    <Button
                      disabled={loading}
                      onClick={() => setDispatchReset(!dispatchReset)}
                      variant="contained"
                      color="warning"
                      className="bg-warning"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => handleAddUser()}
                      variant="contained"
                      className="bg-primary"
                      disabled={loading}
                    >
                      {loading ? (
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
                Content={
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      className="col-span-12 w-full gap-4 p-4"
                    >
                      <Avatar src={image} alt="image" />
                      <ImageUploadButton
                        loading={loading}
                        handleChange={handleImageChange}
                      />
                    </Stack>
                    {Forms.output}
                  </Box>
                }
                modalTitle="Create a student"
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
                tabs: ["All", "Accepts Marketing", "Prospect", "Returning"],
                textColor: "primary",
                indicatorColor: "primary",
                setValue: setValue,
              }}
            />

            <SearchInput />
            <EnhancedTable />
          </PaperContainer>
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export default Page;

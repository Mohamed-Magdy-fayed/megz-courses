import * as React from "react";
import {
  Button,
  Divider,
  FormControl,
  Box,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Input,
  Tooltip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { api } from "@/utils/api";
import { useToastStore } from "@/zustand/store";
import { z } from "zod";
import PasswordField from "./PasswordField";
import CustomInput from "./CustomInput";
import ImageUploadButton from "./ImageUploadButton";

const valuesSchema = z.object({
  userName: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
});

interface ValuesTypes {
  userName: string;
  email: string;
  password: string;
  image?: string;
  phone?: string;
  state?: string;
  country?: string;
  street?: string;
  city?: string;
}

export default function AddStudentForm({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const [values, setValues] = React.useState<ValuesTypes>({
    userName: "",
    email: "",
    password: "",
    state: "",
  });
  const [errors, setErrors] = React.useState<Partial<ValuesTypes>>({});
  const [loading, setLoading] = React.useState(false);

  const handleSelectChange = React.useCallback(
    (event: SelectChangeEvent<HTMLInputElement>) => {
      setValues((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }));
    },
    []
  );

  const handleImageChange = React.useCallback((url: string) => {
    setValues((prevState) => {
      const newValues = {
        ...prevState,
        image: url,
      };
      setErrors(getErrors(newValues));
      return newValues;
    });
  }, []);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prevState) => {
        const newValues = {
          ...prevState,
          [event.target.name]: event.target.value,
        };
        setErrors(getErrors(newValues));
        return newValues;
      });
    },
    [values]
  );

  const trpcUrils = api.useContext();
  const createStudent = api.students.createStudent.useMutation();
  const toast = useToastStore((state) => state);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> =
    React.useCallback(
      (event) => {
        event.preventDefault();
        console.log(values);

        if (!valuesSchema.safeParse(values).success)
          return toast.error("Invalid input");

        setLoading(true);
        createStudent.mutate(values, {
          onSuccess(data) {
            if (data.error?.message) return toast.error(data.error?.message);
            toast.success(`User created with the email: ${data.user?.email}`);
            trpcUrils.students.getStudents.invalidate();
            handleClose();
          },
          onSettled() {
            setLoading(false);
          },
        });
      },
      [values]
    );

  function getErrors(values: any) {
    const parsed = valuesSchema.safeParse(values);
    let errorsObj: Partial<ValuesTypes> = {};

    !parsed.success
      ? parsed.error.issues.map((issue) => {
          errorsObj[issue.path[0] as keyof typeof errorsObj] = issue.message;
        })
      : {};
    console.log(values);
    console.log(errorsObj);

    return errorsObj;
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <Box component="div" className="grid grid-cols-12 gap-4 p-4">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          className="col-span-12 w-full gap-4"
        >
          <Avatar src={values.image} alt="image" />
          <ImageUploadButton
            loading={loading}
            handleChange={handleImageChange}
          />
        </Stack>
        <CustomInput
          loading={loading}
          handleChange={handleChange}
          value={values.userName}
          fullWidth
          label="User Name"
          name="userName"
        />
        <CustomInput
          loading={loading}
          handleChange={handleChange}
          value={values.email}
          error={errors.email && values.email.length > 0 ? true : false}
          fullWidth
          label="Email Address"
          name="email"
          helperText={values.email.length > 0 && errors.email}
        />
        <PasswordField
          password={values.password}
          handleChange={handleChange}
          loading={loading}
        />
        <CustomInput
          loading={loading}
          handleChange={handleChange}
          value={values.phone}
          fullWidth
          label="Phone Number"
          name="phone"
          type="number"
        />
        <CustomInput
          loading={loading}
          handleChange={handleChange}
          value={values.street}
          fullWidth
          label="Street"
          name="street"
        />
        <CustomInput
          loading={loading}
          handleChange={handleChange}
          value={values.city}
          fullWidth
          label="City"
          name="city"
        />
        <CustomInput
          loading={loading}
          handleChange={handleSelectChange}
          value={values.state}
          fullWidth
          name="state"
          label="State"
        />
        <CustomInput
          loading={loading}
          handleChange={handleChange}
          value={values.country}
          fullWidth
          label="Country"
          name="country"
        />
      </Box>
      <Divider />
      <Box component="div" className="flex w-full justify-between gap-4 p-4">
        <Button
          disabled={loading}
          type="reset"
          variant="contained"
          color="warning"
          className="bg-warning"
        >
          Clear
        </Button>
        <Button
          type="submit"
          variant="contained"
          className="bg-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 2 }}></CircularProgress>
              Loading
            </>
          ) : (
            "Create"
          )}
        </Button>
      </Box>
    </form>
  );
}

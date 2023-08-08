import {
  ChangeEvent,
  FormEventHandler,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import CustomInput from "@/components/students/CustomInput";
import { Address, User } from "@prisma/client";
import { z } from "zod";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { PaperContainer } from "@/components/ui/PaperContainers";

const valuesSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
});

interface ValuesTypes {
  name: string;
  email: string;
  phone?: string;
  state?: string;
  country?: string;
  street?: string;
  city?: string;
}

export const AccountDetails = ({
  user,
}: {
  user:
    | (User & {
        address: Address | null;
      })
    | null
    | undefined;
}) => {
  const [values, setValues] = useState<ValuesTypes>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.address?.city || "",
    country: user?.address?.country || "",
    state: user?.address?.state || "",
    street: user?.address?.street || "",
  });
  const [errors, setErrors] = useState<Partial<ValuesTypes>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
  const editUser = api.users.editUser.useMutation();
  const toast = useToastStore((state) => state);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      console.log(values);

      if (!valuesSchema.safeParse(values).success)
        return toast.error("Invalid input");

      setLoading(true);
      if (!user) return;
      editUser.mutate(
        { ...values },
        {
          onSuccess: (data) => {
            trpcUrils.users.invalidate();
            toast.success(
              `User with the email: ${data.updatedUser?.email} has been updated`
            );
          },
          onSettled() {
            setLoading(false);
          },
        }
      );
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
    <form
      autoComplete="off"
      aria-disabled={loading}
      noValidate
      onSubmit={handleSubmit}
    >
      <PaperContainer>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent sx={{ pt: 0 }}>
          <Box component="div" className="grid grid-cols-12 gap-4 p-4">
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.name}
              fullWidth
              label="User Name"
              name="name"
            />
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.email}
              error={errors.email && values.email.length > 0 ? true : false}
              fullWidth
              label="Email Address"
              name="email"
              helperText={values.email.length > 0 && errors.email}
            />
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.phone}
              fullWidth
              label="Phone Number"
              name="phone"
              type="number"
            />
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.street}
              fullWidth
              label="Street"
              name="street"
            />
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.city}
              fullWidth
              label="City"
              name="city"
            />
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.state}
              fullWidth
              name="state"
              label="State"
            />
            <CustomInput
              smallGrid
              loading={loading}
              handleChange={handleChange}
              value={values.country}
              fullWidth
              label="Country"
              name="country"
            />
          </Box>
        </CardContent>
        <Divider />
        <Box component="div" className="flex justify-end p-4">
          <Button variant="contained" className="bg-primary" type="submit">
            Save details
          </Button>
        </Box>
      </PaperContainer>
    </form>
  );
};

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import React from "react";

interface PasswordFieldProps {
  loading: boolean;
  password: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordField({
  loading,
  password,
  handleChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };
  return (
    <FormControl
      fullWidth
      variant="outlined"
      className="col-span-12  md:col-span-6 lg:col-span-4"
    >
      <InputLabel htmlFor="password">Password *</InputLabel>
      <OutlinedInput
        disabled={loading}
        id="password"
        name="password"
        value={password}
        onChange={handleChange}
        required
        type={showPassword ? "text" : "password"}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              type="button"
              tabIndex={0}
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

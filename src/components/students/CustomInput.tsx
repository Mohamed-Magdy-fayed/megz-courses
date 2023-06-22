import { Box, TextField, TextFieldProps } from "@mui/material";
import React from "react";

interface CustomInputProps {
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
}

export default function CustomInput({
  loading,
  handleChange,
  value,
  ...rest
}: CustomInputProps & TextFieldProps) {
  return (
    <Box component="div" className="col-span-12 md:col-span-6 lg:col-span-4">
      <TextField
        {...rest}
        disabled={loading}
        onChange={handleChange}
        value={value}
      />
    </Box>
  );
}

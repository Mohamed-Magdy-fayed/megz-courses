import React from "react";
import { Input, InputProps } from "../ui/input";
import { Label } from "../ui/label";
import { Typography } from "../ui/Typoghraphy";

interface CustomInputProps {
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  smallGrid?: boolean;
  label: string;
  error: string;
}

export default function CustomInput({
  loading,
  handleChange,
  value,
  smallGrid,
  label,
  ...rest
}: CustomInputProps & InputProps) {
  return (
    <div
      className={`${smallGrid ? "col-span-12 lg:col-span-6" : "col-span-12 md:col-span-6 lg:col-span-4"
        }`}
    >
      <Label>{label}</Label>
      <Input
        disabled={loading}
        onChange={handleChange}
        value={value}
        {...rest}
      />
      {error && <Typography>{error}</Typography>}
      
    </div>
  );
}

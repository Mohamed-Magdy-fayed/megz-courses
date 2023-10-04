import { Chip } from "@mui/material";

interface SeverityPillProps {
  label: string;
  color: "primary" | "secondary" | "error" | "info" | "warning" | "success";
}

export const SeverityPill = ({ color, label }: SeverityPillProps) => {
  const tailwindClass =
    color === "success"
      ? "text-[#2e7d32] bg-[#10b9811f]"
      : color === "warning"
        ? "text-[#b54709] bg-[#f790091f]"
        : color === "info"
          ? "text-info bg-info/20"
          : "text-[#d32f2f] bg-[#f044381f]";

  return (
    <Chip
      variant="filled"
      component="span"
      label={label}
      className={`h-6 whitespace-nowrap rounded-xl px-0 py-2 text-center text-xs font-semibold uppercase ${tailwindClass}`}
    />
  );
};

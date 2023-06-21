import React from "react";
import { CircularProgress } from "@mui/material";

export default function Spinner() {
  return (
    <div className="grid min-h-screen place-content-center bg-slate-50">
      <CircularProgress size={100}></CircularProgress>
    </div>
  );
}

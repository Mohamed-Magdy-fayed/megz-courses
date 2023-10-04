import { Loader } from "lucide-react";
import React from "react";

export default function Spinner() {
  return (
    <div className="grid min-h-screen place-content-center bg-slate-50">
      <Loader size={100} className="animate-spin"></Loader>
    </div>
  );
}

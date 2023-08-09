import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { MaterialItem } from "@prisma/client";
import { ArrowRight, Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const MaterialRow = ({ material }: { material: MaterialItem }) => {
  const deleteMaterialMutation =
    api.materials.deleteMaterialItems.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteMaterialMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.lessons.invalidate().then(() => setLoading(false));
      },
      onError: () => {
        toast.error("an error occured!");
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <Typography>{material.title}</Typography>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Tooltip title="Edit Material">
          <IconButton
            onClick={() => router.push(`/content/materials/${material.id}`)}
          >
            <Edit className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Material">
          <IconButton
            disabled={loading}
            className="text-error hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:hover:bg-slate-200"
            onClick={() => handleDelete(material.id)}
          >
            <Trash className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default MaterialRow;

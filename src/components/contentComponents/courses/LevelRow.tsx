import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Level } from "@prisma/client";
import { ArrowRight, Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const LevelRow = ({ level }: { level: Level }) => {
  const { data, isLoading, isError } = api.lessons.getByLevelId.useQuery({
    levelId: level.id,
  });
  const deleteLevelMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteLevelMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.courses.invalidate().then(() => setLoading(false));
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
        <Typography>{level.name}</Typography>
        <Typography>{level.code}</Typography>
      </div>
      <div>
        {isLoading ? (
          "loading..."
        ) : isError ? (
          "Error!"
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Typography>Lessons#</Typography>
            <ArrowRight className="h-4 w-4" />
            <Typography>{data.lessons.length}</Typography>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Tooltip title="Edit Level">
          <IconButton
            onClick={() => router.push(`/content/levels/${level.id}`)}
          >
            <Edit className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Level">
          <IconButton
            disabled={loading}
            className="text-error hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:hover:bg-slate-200"
            onClick={() => handleDelete(level.id)}
          >
            <Trash className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default LevelRow;

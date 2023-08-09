import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Copy, Edit, Edit2, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/zustand/store";
import { useState } from "react";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import LessonRow from "./LessonRow";

const LevelCard = ({ id }: { id: string }) => {
  const { data } = api.levels.getById.useQuery({
    id,
  });
  const level = data?.level;
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

  if (!level) return <CardsSkeleton />;

  return (
    <div>
      <PaperContainer>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <Typography>{level.name}</Typography>
              <Typography className="text-xs font-bold text-primary">
                {level.code}
              </Typography>
            </div>
            <Tooltip title="Edit Level">
              <IconButton
                onClick={() => router.push(`/content/levels/${level.id}`)}
              >
                <Edit2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
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
        <Separator />
        {level.lessons.length === 0 && (
          <div className="p-4">
            <Typography>No lessons added yet</Typography>
          </div>
        )}
        {level.lessons.map((lesson, i) => (
          <>
            {i !== 0 && <Separator />}
            <LessonRow key={level.id} lesson={lesson} />
          </>
        ))}
        <Separator />
        <div className="flex w-full p-4">
          <Button variant="ghost" type="button">
            <Copy className="mr-2 h-4 w-4" />
            Dublicate
          </Button>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => router.push(`/content/levels/${level.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Configure lessons
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
};

export default LevelCard;
